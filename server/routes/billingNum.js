import express from "express";
import billingNum from "../models/billingNum";
import jwt from "jsonwebtoken";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

