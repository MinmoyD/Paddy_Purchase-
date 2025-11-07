import express from "express"; 
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected"))
.catch((err) => console.error("MongoDB connection error:", err));

// Schema & Model
const labFormSchema = new mongoose.Schema({
  carNo: String,
  siNo: Number,
  paddyName: String,
  paddyMoisture: Number,
  riceMoisture: Number,
  paddyWeight: Number,
  husk: Number,
  bran: Number,
  dust: Number,
  ddc: Number,
  paddyPercent: Number,
  totalRice: Number,
  huskToRice: Number,
  totalHandRice: Number,
  createdBy: String,
}, { timestamps: true });

const LabForm = mongoose.model("LabForm", labFormSchema);

// Routes

// POST new lab form
app.post("/api/labform", async (req, res) => {
  try {
    const formData = new LabForm(req.body);
    const savedData = await formData.save();
    res.status(201).json(savedData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save form data" });
  }
});

// GET lab forms (filter by carNo if provided)
app.get("/api/labform", async (req, res) => {
  try {
    const { carNo } = req.query;
    const query = carNo ? { carNo } : {};
    const allForms = await LabForm.find(query).sort({ createdAt: -1 });
    res.json(allForms);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});


// DELETE labform by ID
// DELETE labform by ID
app.delete("/api/labform/:id", async (req, res) => {
  try {
    const deleted = await LabForm.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Entry not found" });
    }
    res.json({ success: true, message: "Entry deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error deleting entry" });
  }
});





// Start server
const PORT = process.env.PORT || 4010;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
