"use strict";

import express from "express";
import {
  getAllBooks,
  searchABookByTitle,
  searchABookByAuthor,
  createNewBook,
  updateCreatedBook,
  deleteCreatedBook,
} from "../controllers/bookController.js";

const router = express.Router();

/**
 * Récupère la liste de tous les livres disponibles
 */
router.get("/", getAllBooks);

/**
 * Recherche un livre à partir de son titre. Utilise l'objet query string pour capturer le titre du livre
 */
router.get("/search/book/title/:title", searchABookByTitle);

/**
 * Recherche un livre à partir de son auteur. Utilise l'objet query string pour capturer le nom de l'auteur
 */
router.get("/search/book/author/:author_name", searchABookByAuthor);

/**
 * Crée un nouveau livre
 */
router.post("/", createNewBook);

/**
 * Modifie un livre existant
 */
router.put("/update/:book_id", updateCreatedBook);

/**
 * Supprime un livre existant
 */
router.delete("/delete/:book_id", deleteCreatedBook);

export default router;
