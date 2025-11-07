import mongoose , {Schema} from "mongoose";

const ChallaiSchema = new Schema({
    LastUpdate: String,
    Date: String,
    Type: String,
    Bags: Number,
    Weight: Number,
    CarNo: String,
    PartyName: String,
    UnloaderName: String,
});

const Challai = mongoose.model('Challai', ChallaiSchema);

export default Challai;