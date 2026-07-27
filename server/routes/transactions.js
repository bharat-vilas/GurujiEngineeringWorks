import express from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import Transaction from "../models/Transaction.js";

const router = express.Router();

// GET /api/transactions?year=2025&month=7 (month optional)
router.get("/", authenticateToken, async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const month = req.query.month ? parseInt(req.query.month) : null;

    const start = month ? new Date(year, month - 1, 1) : new Date(year, 0, 1);
    const end   = month ? new Date(year, month, 1)     : new Date(year + 1, 0, 1);

    const records = await Transaction.find({ date: { $gte: start, $lt: end } })
      .sort({ date: -1 })
      .lean();

    return res.status(200).json(records);
  } catch (err) {
    return res.status(500).json({ message: "Server error.", error: err.message });
  }
});

// POST /api/transactions
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { type, category, amount, date, description, reference, paymentMode } = req.body;
    if (!type || !category || !amount || !date) {
      return res.status(400).json({ message: "type, category, amount and date are required." });
    }
    const transaction = new Transaction({ type, category, amount, date, description, reference, paymentMode });
    await transaction.save();
    return res.status(201).json({ message: "Transaction added.", transaction });
  } catch (err) {
    return res.status(500).json({ message: "Server error.", error: err.message });
  }
});

// PUT /api/transactions/:id
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const { type, category, amount, date, description, reference, paymentMode } = req.body;
    const transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      { type, category, amount, date, description, reference, paymentMode, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    if (!transaction) return res.status(404).json({ message: "Transaction not found." });
    return res.status(200).json({ message: "Transaction updated.", transaction });
  } catch (err) {
    return res.status(500).json({ message: "Server error.", error: err.message });
  }
});

// DELETE /api/transactions/:id
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndDelete(req.params.id);
    if (!transaction) return res.status(404).json({ message: "Transaction not found." });
    return res.status(200).json({ message: "Transaction deleted." });
  } catch (err) {
    return res.status(500).json({ message: "Server error.", error: err.message });
  }
});

export default router;
