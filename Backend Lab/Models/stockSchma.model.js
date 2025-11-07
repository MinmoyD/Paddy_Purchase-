    import mongoose , {Schema} from "mongoose";

    const stockSchema = new Schema({
        LastUpdate: String,
        Date: String,
        Type: String,
        Bags: Number,
        Weight: Number,
        CarNo: String,
        PartyName: String,
        UnloaderName: String,
    });

    const Stock = mongoose.model('Stock', stockSchema);

    export default Stock;