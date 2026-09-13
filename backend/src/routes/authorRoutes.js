"use strict";

import express from "express";
const router = express.Router();

/**
 * Entrée principale pour les auteurs. Affiche tous les auteurs disponibles.
 */
router.get("/", (req, res) => {
  res.json("Le requette a bien été routée");
});

/**
 * Création d'un auteur
 */
router.post("/", (req, res) => {
  res.json("Un nouvel auteur a été ajouté avec succès");
});

/**
 * Modification d'un auteur à partir de l'id de celui-ci
 */
router.put("/:id", (req, res) => {
  res.json(`L'auteur avec l'id ${req.params.id} a bien été modifié`);
});

/**
 * Suppression d'un auteur à partir de l'id de celui-ci
 */
router.delete("/:id", (req, res) => {
  res.json(`L'auteur avec l'id ${req.params.id} a bien été supprimé`);
});

export default router;
