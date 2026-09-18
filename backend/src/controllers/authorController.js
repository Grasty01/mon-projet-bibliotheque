"use strict";

import {
  findAllAuthors,
  creatAnAuthor,
  updateAnExistingAuthor,
  deletAnExistingAuthor,
} from "../models/authorModel.js";

/**
 * Return all authors on datablase
 * @param {*} req
 * @param {*} res
 */
export let getAllAuthors = async (req, res) => {
  try {
    const results = await findAllAuthors();
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json("Oups, une erreur 500 (Erreur Serveur) est survenue");
  }
};

/**
 * Create a new author
 * @param {*} req
 * @param {*} res
 */
export let createAuthor = async (req, res) => {
  try {
    const bodyOfRequest = req.body;
    const newAuthorCreated = await creatAnAuthor(
      bodyOfRequest.name,
      bodyOfRequest.nationality,
    );

    if (!newAuthorCreated) {
      res.status(400).json("Impossible d'ajouter un utilisateur");
    }

    res.status(201).json(newAuthorCreated);
  } catch (error) {
    res
      .status(500)
      .json(
        "Oups, une erreur 500 (Erreur Serveur) est survenue. Impossible d'ajouter un auteur ",
      );
  }
};

/**
 * Update information of an author
 * @param {*} req
 * @param {*} res
 */
export let updateAuthor = async (req, res) => {
  try {
    const authorQueryString = req.query;
    const newAuthorWasUpdated = await updateAnExistingAuthor(
      req.params.id,
      authorQueryString.name,
      authorQueryString.nationality,
    );

    if (!newAuthorWasUpdated) {
      res
        .status(500)
        .json("Une erreur est survenue lors de la mise à jour de cet auteur");
    }

    res.status(201).json(newAuthorWasUpdated.rows);
  } catch (error) {
    res
      .status(500)
      .json("Une erreur est survenue lors de la mise à jour de cet auteur");
  }
};

/**
 * Delete an author
 * @param {*} req
 * @param {*} res
 */
export let deleteAuthor = async (req, res) => {
  try {
    const authorWasDeleted = await deletAnExistingAuthor(req.params.id);

    if (!authorWasDeleted) {
      res.status(500).json({ message: "Impossible de supprimer cet auteur" });
      return;
    }

    res.status(200).json({
      message: `L'auteur ${authorWasDeleted.rows[0].author_name} a été supprimé avec succès`,
      author: authorWasDeleted.rows,
    });
  } catch (error) {
    res.status(500).json({
      message: "Une erreur est survenue lors de la suppression de cet auteur",
    });
  }
};
