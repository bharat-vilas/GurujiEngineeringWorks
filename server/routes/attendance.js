import express from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import Attendance from "../models/Attendance.js";

const router = express.Router();

// GET /api/attendance?month=7&year=2025
// Returns all attendance records for a given month across all employees
router.get("/", authenticateToken, async (req, res) => {
  try {
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;
    const year = parseInt(req.query.year) || new Date().getFullYear();

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1); // exclusive

    const records = await Attendance.find({
      date: { $gte: start, $lt: end },
    }).populate("employee", "name designation status").lean();

    return res.status(200).json(records);
  } catch (err) {
    return res.status(500).json({ message: "Server error.", error: err.message });
  }
});

// POST /api/attendance — upsert (create or update)
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { employeeId, date, status, extraHours, note } = req.body;
    if (!employeeId || !date || !status) {
      return res.status(400).json({ message: "employeeId, date and status are required." });
    }

    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);

    const record = await Attendance.findOneAndUpdate(
      { employee: employeeId, date: dayStart },
      { employee: employeeId, date: dayStart, status, extraHours: extraHours || 0, note: note || "" },
      { upsert: true, new: true, runValidators: true }
    );

    return res.status(200).json({ message: "Attendance saved.", record });
  } catch (err) {
    return res.status(500).json({ message: "Server error.", error: err.message });
  }
});

// DELETE /api/attendance/:id — unmark a day
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    await Attendance.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: "Record deleted." });
  } catch (err) {
    return res.status(500).json({ message: "Server error.", error: err.message });
  }
});

export default router;
