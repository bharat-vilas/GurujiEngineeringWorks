import express from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import Employee from "../models/Employee.js";

const router = express.Router();

router.get("/", authenticateToken, async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    return res.status(200).json(employees);
  } catch (err) {
    return res.status(500).json({ message: "Server error.", error: err.message });
  }
});

router.post("/", authenticateToken, async (req, res) => {
  try {
    const { name, designation, department, phone, email, address, joiningDate, salary, status, employeeType } = req.body;
    if (!name || !designation) {
      return res.status(400).json({ message: "Name and designation are required." });
    }
    const employee = new Employee({ name, designation, department, phone, email, address, joiningDate, salary, status, employeeType });
    await employee.save();
    return res.status(201).json({ message: "Employee added successfully.", employee });
  } catch (err) {
    return res.status(500).json({ message: "Server error.", error: err.message });
  }
});

router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const { name, designation, department, phone, email, address, joiningDate, salary, status, employeeType } = req.body;
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { name, designation, department, phone, email, address, joiningDate, salary, status, employeeType, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    if (!employee) return res.status(404).json({ message: "Employee not found." });
    return res.status(200).json({ message: "Employee updated successfully.", employee });
  } catch (err) {
    return res.status(500).json({ message: "Server error.", error: err.message });
  }
});

router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) return res.status(404).json({ message: "Employee not found." });
    return res.status(200).json({ message: "Employee deleted successfully." });
  } catch (err) {
    return res.status(500).json({ message: "Server error.", error: err.message });
  }
});

export default router;
