import mongoose from "mongoose";

// Serial Number schema & model
const SerialNumberSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ["quotation", "billing", "challan"],
    unique: true,
  },
  serialNumber: {
    type: String,
    required: true,
    // Format: YEAR/TYPE/SERIAL (e.g., 2025/q/0001)
  },
});

const SerialNumber = mongoose.model("SerialNumber", SerialNumberSchema);

export default SerialNumber;
