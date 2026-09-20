"use strict";

import express from "express";
import { createLoan, returnLoan } from "../controllers/loanController.js";
import verifyLibrarianRole from "../middlewares/authMiddleware.js";

const router = express.Router();

/**
 * Crée un emprunt
 */
router.post("/", verifyLibrarianRole, createLoan);

/**
 * Crée un retour d'un livre emprunté
 */
router.put("/:loan_id/return", verifyLibrarianRole, returnLoan);

export default router;
