//Auteurs
"use strict";

import { dbConnexion } from "../../config/db.js";
const pool = dbConnexion();

/**
 *
 * @returns all authors on database
 */
export let findAllAuthors = async () => {
  try {
    const query = "SELECT * FROM authors";
    const results = await pool.query(query);
    return results.rows;
  } catch (error) {
    throw new Error(
      `Une erreur est survenue, impossible d'accéder à la base de données ${error}`,
    );
  }
};

/**
 *@returns An author created
 * @param {string} authorName
 * @param {string} authorNationality
 */
export let creatAnAuthor = async (authorName, authorNationality) => {
  try {
    const query = "INSERT INTO authors(author_name, author_nationality) VALUES($1, $2) RETURNING *";
    const queryParam = [authorName, authorNationality];
    const result = await pool.query(query, queryParam);
    return result.rows;
  } catch (error) {
    throw new Error(`Oups, impossible d'ajouter un auteur ${error}`);
  }
};

/**
 *
 * @param {number} authorId
 * @param {string} newAuthorName
 * @param {string} newAuthorNationnality
 * @returns the new author was updated
 */
export let updateAnExistingAuthor = async (
  authorId,
  newAuthorName,
  newAuthorNationnality,
) => {
  try {
    const query =
      "UPDATE authors SET author_name = $1, author_nationality = $2 WHERE author_id = $3 RETURNING *";
    const queryParam = [newAuthorName, newAuthorNationnality, authorId];
    const result = await pool.query(query, queryParam);

    return result;
  } catch (error) {
    throw new Error(
      `Oups, impossible d'apporter les modification sur cet auteur ${error}`,
    );
  }
};

/**
 *
 * @param {number} authorId
 * @returns {object} author was deleted
 */
export let deletAnExistingAuthor = (authorId) => {
  try {
    const query = "DELETE FROM authors WHERE author_id = $1 RETURNING *";
    const authorWasDeleted = pool.query(query, [authorId]);
    return authorWasDeleted;
  } catch (error) {
    throw new Error(`Oups, impossible de supprimer cet auteur ${error}`);
  }
};
