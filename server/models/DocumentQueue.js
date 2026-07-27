import mongoose from "mongoose";

const documentQueueSchema = new mongoose.Schema({
  type: { type: String, enum: ["quotation", "billing", "challan"], required: true },
  documentNumber: { type: String, required: true },
  clientName: { type: String, required: true },
  clientFirm: { type: String, default: "" },
  amount: { type: Number, default: 0 },
  documentDate: { type: Date, default: null },
  status: { type: String, enum: ["pending", "checked"], default: "pending" },
  checkedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
});

// Auto-delete checked items 30 days after checkedAt
documentQueueSchema.index({ checkedAt: 1 }, { expireAfterSeconds: 2592000, sparse: true });

export default mongoose.model("DocumentQueue", documentQueueSchema);
