import express from "express";
import {
  getAllMembers,
  getAllOfLoansMember,
  createMember,
  updateMember,
  deleteMember,
} from "../controllers/memberController.js";

const router = express.Router();

/**
 * Récupère la liste de tous les adhérents ou membres
 */
router.get("/", getAllMembers);

/**
 * Récupère la list d'emprunts en cours ou passés d'un membre
 */
router.get("/:id/loans", getAllOfLoansMember);

/**
 * Crée un nouveau membre
 */
router.post("/", createMember);

/**
 * Mets à jour un membre à partir de son id
 */
router.put("/:id", updateMember);

/**
 * Supprime un membre à partir de son id
 */
router.delete("/:id", deleteMember);

export default router;
