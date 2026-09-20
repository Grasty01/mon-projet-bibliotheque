"use strict";

import { getDashboardStats } from "../controllers/dashboardController.js";
import express from "express";

const router = express.Router();

/**
 * Gère la route pour les states
 */
router.get("/", getDashboardStats);

export default router;
