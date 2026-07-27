import express from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import Client from "../models/Client.js";

const router = express.Router();

// GET /api/clients - Get all clients
router.get("/", authenticateToken, async (req, res) => {
  try {
    const clients = await Client.find().sort({ createdAt: -1 });
    return res.status(200).json(clients);
  } catch (err) {
    console.error("Get clients error:", err);
    return res.status(500).json({
      message: "Server error. Please try again later.",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

// GET /api/clients/:id - Get a specific client
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ message: "Client not found." });
    }
    return res.status(200).json(client);
  } catch (err) {
    console.error("Get client error:", err);
    return res.status(500).json({
      message: "Server error. Please try again later.",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

// POST /api/clients - Create a new client
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { name, firm, address, email, phone, gstin, state, pinCode } = req.body;

    if (!name || !firm || !address) {
      return res.status(400).json({
        message: "Name, firm, and address are required.",
      });
    }

    const newClient = new Client({
      name,
      firm,
      address,
      email,
      phone,
      gstin,
      state,
      pinCode,
    });

    await newClient.save();

    return res.status(201).json({
      message: "Client registered successfully.",
      client: newClient,
    });
  } catch (err) {
    console.error("Create client error:", err);
    return res.status(500).json({
      message: "Server error. Please try again later.",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

// PUT /api/clients/:id - Update a client
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const { name, firm, address, email, phone, gstin, state, pinCode } = req.body;

    const client = await Client.findByIdAndUpdate(
      req.params.id,
      {
        name,
        firm,
        address,
        email,
        phone,
        gstin,
        state,
        pinCode,
        updatedAt: Date.now(),
      },
      { new: true, runValidators: true }
    );

    if (!client) {
      return res.status(404).json({ message: "Client not found." });
    }

    return res.status(200).json({
      message: "Client updated successfully.",
      client,
    });
  } catch (err) {
    console.error("Update client error:", err);
    return res.status(500).json({
      message: "Server error. Please try again later.",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

// DELETE /api/clients/:id - Delete a client
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);

    if (!client) {
      return res.status(404).json({ message: "Client not found." });
    }

    return res.status(200).json({
      message: "Client deleted successfully.",
    });
  } catch (err) {
    console.error("Delete client error:", err);
    return res.status(500).json({
      message: "Server error. Please try again later.",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

export default router;

