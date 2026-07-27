import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema({
  type: { type: String, enum: ["income", "expense"], required: true },
  category: { type: String, required: true, trim: true },
  amount: { type: Number, required: true, min: 0 },
  date: { type: Date, required: true, default: Date.now },
  description: { type: String, trim: true, default: "" },
  reference: { type: String, trim: true, default: "" },
  paymentMode: {
    type: String,
    enum: ["Cash", "Bank Transfer", "Cheque", "UPI", "Other"],
    default: "Cash",
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

TransactionSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Transaction = mongoose.model("Transaction", TransactionSchema);
export default Transaction;
