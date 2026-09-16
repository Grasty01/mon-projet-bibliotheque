"use strict";

import {
  getAllAuthors,
  createAuthor,
  updateAuthor,
  deleteAuthor,
} from "../controllers/authorController.js";
import express from "express";
const router = express.Router();

/**
 * Entrée principale pour les auteurs. Affiche tous les auteurs disponibles.
 */
router.get("/", getAllAuthors);

/**
 * Création d'un auteur
 */
router.post("/", createAuthor);

/**
 * Modification d'un auteur à partir de l'id de celui-ci
 */
router.put("/:id", updateAuthor);

/**
 * Suppression d'un auteur à partir de l'id de celui-ci
 */
router.delete("/:id", deleteAuthor);

export default router;
