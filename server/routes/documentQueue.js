import express from "express";
import DocumentQueue from "../models/DocumentQueue.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(authenticateToken);

router.get("/", async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const items = await DocumentQueue.find(filter).sort({ createdAt: -1 });
    res.json(items);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { type, documentNumber, clientName, clientFirm, amount, documentDate } = req.body;
    const item = new DocumentQueue({ type, documentNumber, clientName, clientFirm, amount, documentDate });
    await item.save();
    res.status(201).json(item);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

router.patch("/:id/check", async (req, res) => {
  try {
    const item = await DocumentQueue.findByIdAndUpdate(
      req.params.id,
      { status: "checked", checkedAt: new Date() },
      { new: true }
    );
    if (!item) return res.status(404).json({ message: "Not found" });
    res.json(item);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

router.patch("/:id/uncheck", async (req, res) => {
  try {
    const item = await DocumentQueue.findByIdAndUpdate(
      req.params.id,
      { status: "pending", checkedAt: null },
      { new: true }
    );
    if (!item) return res.status(404).json({ message: "Not found" });
    res.json(item);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await DocumentQueue.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
