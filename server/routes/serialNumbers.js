import express from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import SerialNumber from "../models/SerialNumber.js";
import {
  formatSerialNumber,
  parseSerialNumber,
  incrementSerialNumber,
  getDefaultSerialNumber,
} from "../utils/serialNumberUtils.js";

const router = express.Router();

// GET /api/serial-numbers - Get all current serial numbers
router.get("/", authenticateToken, async (req, res) => {
  try {
    const serials = await SerialNumber.find();

    // Initialize defaults if they don't exist
    const defaults = {
      quotation: getDefaultSerialNumber("quotation"),
      billing: getDefaultSerialNumber("billing"),
      challan: getDefaultSerialNumber("challan"),
    };

    const result = {
      quotation: defaults.quotation,
      billing: defaults.billing,
      challan: defaults.challan,
    };

    serials.forEach((serial) => {
      result[serial.type] = serial.serialNumber;
    });

    return res.status(200).json(result);
  } catch (err) {
    console.error("Get serial numbers error:", err);
    return res.status(500).json({
      message: "Server error. Please try again later.",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

// GET /api/serial-numbers/:type - Get current number for a specific type
router.get("/:type", authenticateToken, async (req, res) => {
  try {
    const { type } = req.params;

    if (!["quotation", "billing", "challan"].includes(type)) {
      return res.status(400).json({
        message: "Invalid type. Must be 'quotation', 'billing', or 'challan'.",
      });
    }

    let serial = await SerialNumber.findOne({ type });

    if (!serial) {
      // Create if doesn't exist with default format
      const defaultSerial = getDefaultSerialNumber(type);
      serial = new SerialNumber({ type, serialNumber: defaultSerial });
      await serial.save();
    }

    return res.status(200).json({
      type: serial.type,
      serialNumber: serial.serialNumber,
    });
  } catch (err) {
    console.error("Get serial number error:", err);
    return res.status(500).json({
      message: "Server error. Please try again later.",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

// POST /api/serial-numbers - Create or initialize all serial numbers
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { quotation, billing, challan } = req.body;

    const result = {};

    // Initialize quotation if provided
    if (quotation !== undefined) {
      if (
        typeof quotation !== "string" ||
        !quotation.match(/^\d{4}\/q\/\d{4}$/)
      ) {
        return res.status(400).json({
          message:
            "quotation must be a string in format: YYYY/q/NNNN (e.g., 2025/q/0001).",
        });
      }
      const serial = await SerialNumber.findOneAndUpdate(
        { type: "quotation" },
        { serialNumber: quotation },
        { new: true, upsert: true }
      );
      result.quotation = serial.serialNumber;
    }

    // Initialize billing if provided
    if (billing !== undefined) {
      if (typeof billing !== "string" || !billing.match(/^\d{4}\/b\/\d{4}$/)) {
        return res.status(400).json({
          message:
            "billing must be a string in format: YYYY/b/NNNN (e.g., 2025/b/0001).",
        });
      }
      const serial = await SerialNumber.findOneAndUpdate(
        { type: "billing" },
        { serialNumber: billing },
        { new: true, upsert: true }
      );
      result.billing = serial.serialNumber;
    }

    // Initialize challan if provided
    if (challan !== undefined) {
      if (typeof challan !== "string" || !challan.match(/^\d{4}\/c\/\d{4}$/)) {
        return res.status(400).json({
          message:
            "challan must be a string in format: YYYY/c/NNNN (e.g., 2025/c/0001).",
        });
      }
      const serial = await SerialNumber.findOneAndUpdate(
        { type: "challan" },
        { serialNumber: challan },
        { new: true, upsert: true }
      );
      result.challan = serial.serialNumber;
    }

    // If no values provided, return error
    if (Object.keys(result).length === 0) {
      return res.status(400).json({
        message:
          "Please provide at least one serial number (quotation, billing, or challan).",
      });
    }

    return res.status(201).json({
      message: "Serial numbers initialized successfully.",
      ...result,
    });
  } catch (err) {
    console.error("Create serial numbers error:", err);
    return res.status(500).json({
      message: "Server error. Please try again later.",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

// POST /api/serial-numbers/:type - Create or initialize a specific serial number
router.post("/:type", authenticateToken, async (req, res) => {
  try {
    const { type } = req.params;
    const { serialNumber } = req.body;

    if (!["quotation", "billing", "challan"].includes(type)) {
      return res.status(400).json({
        message: "Invalid type. Must be 'quotation', 'billing', or 'challan'.",
      });
    }

    if (serialNumber === undefined) {
      return res.status(400).json({
        message:
          "serialNumber is required in request body (format: YYYY/TYPE/NNNN).",
      });
    }

    // Validate format
    const typeCode = { quotation: "q", billing: "b", challan: "c" }[type];
    const expectedPattern = new RegExp(`^\\d{4}/${typeCode}/\\d{4}$`);
    if (
      typeof serialNumber !== "string" ||
      !serialNumber.match(expectedPattern)
    ) {
      return res.status(400).json({
        message: `serialNumber must be a string in format: YYYY/${typeCode}/NNNN (e.g., 2025/${typeCode}/0001).`,
      });
    }

    // Check if already exists
    const existing = await SerialNumber.findOne({ type });
    if (existing) {
      return res.status(409).json({
        message: `${type} serial number already exists. Use PUT to update it.`,
        serialNumber: existing.serialNumber,
      });
    }

    // Create new serial number
    const serial = new SerialNumber({ type, serialNumber });
    await serial.save();

    return res.status(201).json({
      type: serial.type,
      serialNumber: serial.serialNumber,
      message: `${type} serial number created successfully.`,
    });
  } catch (err) {
    console.error("Create serial number error:", err);
    return res.status(500).json({
      message: "Server error. Please try again later.",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

// POST /api/serial-numbers/:type/increment - Increment and get next number
router.post("/:type/increment", authenticateToken, async (req, res) => {
  try {
    const { type } = req.params;

    if (!["quotation", "billing", "challan"].includes(type)) {
      return res.status(400).json({
        message: "Invalid type. Must be 'quotation', 'billing', or 'challan'.",
      });
    }

    // Find existing serial or create default
    let serial = await SerialNumber.findOne({ type });

    if (!serial) {
      // Create with default if doesn't exist
      const defaultSerial = getDefaultSerialNumber(type);
      serial = new SerialNumber({ type, serialNumber: defaultSerial });
      await serial.save();
    }

    // Increment the serial number
    const newSerialNumber = incrementSerialNumber(serial.serialNumber, type);

    // Update in database
    serial.serialNumber = newSerialNumber;
    await serial.save();

    return res.status(200).json({
      type: serial.type,
      serialNumber: serial.serialNumber,
      message: `${type} number incremented successfully.`,
    });
  } catch (err) {
    console.error("Increment serial number error:", err);
    return res.status(500).json({
      message: "Server error. Please try again later.",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

// PUT /api/serial-numbers/:type - Update serial number (admin use)
router.put("/:type", authenticateToken, async (req, res) => {
  try {
    const { type } = req.params;
    const { serialNumber } = req.body;

    if (!["quotation", "billing", "challan"].includes(type)) {
      return res.status(400).json({
        message: "Invalid type. Must be 'quotation', 'billing', or 'challan'.",
      });
    }

    if (serialNumber === undefined) {
      return res.status(400).json({
        message:
          "serialNumber is required in request body (format: YYYY/TYPE/NNNN).",
      });
    }

    // Validate format
    const typeCode = { quotation: "q", billing: "b", challan: "c" }[type];
    const expectedPattern = new RegExp(`^\\d{4}/${typeCode}/\\d{4}$`);
    if (
      typeof serialNumber !== "string" ||
      !serialNumber.match(expectedPattern)
    ) {
      return res.status(400).json({
        message: `serialNumber must be a string in format: YYYY/${typeCode}/NNNN (e.g., 2025/${typeCode}/0001).`,
      });
    }

    const serial = await SerialNumber.findOneAndUpdate(
      { type },
      { serialNumber },
      { new: true, upsert: true }
    );

    return res.status(200).json({
      type: serial.type,
      serialNumber: serial.serialNumber,
      message: `${type} number updated successfully.`,
    });
  } catch (err) {
    console.error("Update serial number error:", err);
    return res.status(500).json({
      message: "Server error. Please try again later.",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

export default router;
