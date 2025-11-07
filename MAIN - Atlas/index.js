// merged-server.js
// Single project that runs three independent Express apps (each with own mongoose connection + DB)
// Ports kept exactly as requested: 4000, 5000, 7000

import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

dotenv.config();

// --- PORTS (kept exactly as in your original files) ---
const PORT_CAR = 4000;   // carArrival server
const PORT_QR = 5000;    // qrscanner server
const PORT_STOCK = 7000; // stock server

// --- Mongo URIs (can be overridden with env variables) ---
const MONGO_CAR_URI = process.env.MONGO_CAR_URI || 'mongodb://127.0.0.1:27017/carArrivedb';
const MONGO_QR_URI = process.env.MONGO_QR_URI || 'mongodb://127.0.0.1:27017/qrscannerdb';
const MONGO_STOCK_URI = process.env.MONGO_STOCK_URI || 'mongodb://127.0.0.1:27017/mydatabase';

const connOptions = { useNewUrlParser: true, useUnifiedTopology: true };

// Create separate mongoose connections for isolation (each DB independent)
const carConn = mongoose.createConnection(MONGO_CAR_URI, connOptions);
carConn.on('connected', () => console.log(`✅ Car DB connected: ${MONGO_CAR_URI}`));
carConn.on('error', (err) => console.error('❌ Car DB connection error:', err));

const qrConn = mongoose.createConnection(MONGO_QR_URI, connOptions);
qrConn.on('connected', () => console.log(`✅ QR DB connected: ${MONGO_QR_URI}`));
qrConn.on('error', (err) => console.error('❌ QR DB connection error:', err));

const stockConn = mongoose.createConnection(MONGO_STOCK_URI, connOptions);
stockConn.on('connected', () => console.log(`✅ Stock DB connected: ${MONGO_STOCK_URI}`));
stockConn.on('error', (err) => console.error('❌ Stock DB connection error:', err));

/* ------------------------------
   1) CarArrival app  (PORT 4000)
   ------------------------------ */
const carApp = express();

carApp.use(cors());
carApp.use(express.json({ limit: '50mb' }));
carApp.use(express.urlencoded({ limit: '50mb', extended: true }));

const carArrivalSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  history: Array,
  logs: Array,
}, { timestamps: true });

const CarArrival = carConn.model('CarArrival', carArrivalSchema);

carApp.get('/', (req, res) => {
  res.send('Hello World! (CarArrival)');
});

carApp.get('/carArrival', async (req, res) => {
  try {
    const data = await CarArrival.find().sort({ timestamp: -1 }).limit(1);
    res.json(data[0] || { history: [], logs: [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

carApp.post('/carArrival', async (req, res) => {
  try {
    const { history, logs } = req.body;

    if (!Array.isArray(history) || !Array.isArray(logs)) {
      return res.status(400).json({ error: "history and logs must be arrays" });
    }

    if (history.length === 0 && logs.length === 0) {
      return res.status(400).json({ error: "Empty data, not saving" });
    }

    const latest = await CarArrival.findOne().sort({ timestamp: -1 });

    if (latest) {
      latest.history = history;
      latest.logs = logs;
      latest.timestamp = Date.now();
      await latest.save();
    } else {
      const newEntry = new CarArrival({ history, logs });
      await newEntry.save();
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save data' });
  }
});

carApp.listen(PORT_CAR, () => {
  console.log(`🚗 CarArrival server listening on http://localhost:${PORT_CAR}`);
});

/* ------------------------------
   2) QR Scanner app  (PORT 5000)
   ------------------------------ */
const qrApp = express();

qrApp.use(cors());
qrApp.use(express.json());

const scanSchema = new mongoose.Schema({}, { strict: false }); // flexible schema like original
const Scan = qrConn.model('Scan', scanSchema);

qrApp.get('/', (req, res) => {
  res.send('QR Scanner API is running!');
});

qrApp.post('/api/scans', async (req, res) => {
  console.log('Received data:', req.body);
  try {
    const data = req.body;
    if (!data || Object.keys(data).length === 0) {
      return res.status(400).json({ message: "No data received" });
    }

    const scan = new Scan(data);
    await scan.save();
    res.status(201).json({ message: "Data saved to MongoDB", data: scan });
  } catch (err) {
    console.error("Error saving scan:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

qrApp.get('/api/scans', async (req, res) => {
  try {
    const scans = await Scan.find().sort({ _id: -1 });
    res.json(scans);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

qrApp.listen(PORT_QR, () => {
  console.log(`📷 QR Scanner server listening on http://localhost:${PORT_QR}`);
});

/* ------------------------------
   3) Stock app  (PORT 7000)
   ------------------------------ */
const stockApp = express();

stockApp.use(cors());
stockApp.use(express.json());
stockApp.use(express.urlencoded({ extended: true }));

const stockSchema = new mongoose.Schema({
  LastUpdate: String,
  Date: String,          // "yyyy-mm-dd"
  Type: String,
  Bags: Number,
  Weight: Number,
  CarNo: String,
  PartyName: String,
  UnloaderName: String,
});

const Stock = stockConn.model('Stock', stockSchema);

// 1. Return all stock entries (for table)
stockApp.get('/api/stocks/all', async (req, res) => {
  try {
    const stocks = await Stock.find().sort({ Date: -1 });
    res.json(stocks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Return daily aggregated volumes (for chart)
stockApp.get('/api/stocks/daily', async (req, res) => {
  try {
    const stocks = await Stock.find();
    const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const dailyTotals = {};
    weekDays.forEach(day => dailyTotals[day] = 0);

    stocks.forEach((stock) => {
      const day = new Date(stock.Date).toLocaleDateString("en-US", { weekday: "short" }); // Mon, Tue, etc.
      if (dailyTotals[day] !== undefined) {
        dailyTotals[day] += stock.Weight || 60; // default 60kg per entry like original
      }
    });

    const result = weekDays.map(day => ({ day, volume: dailyTotals[day] }));
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// 3. Add new stock
stockApp.post('/api/stocks', async (req, res) => {
  try {
    const stock = new Stock(req.body);
    await stock.save();
    res.status(201).json(stock);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

stockApp.listen(PORT_STOCK, () => {
  console.log(`📦 Stock server listening on http://localhost:${PORT_STOCK}`);
});
