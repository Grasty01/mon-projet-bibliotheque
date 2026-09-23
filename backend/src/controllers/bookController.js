"use strict";

import {
  findAllBooks,
  findBookByTitle,
  findBookByAuthor,
  createANewBook,
  updateAnExistingBook,
  deleteAnExistingBook,
} from "../models/bookModel.js";

/**
 *
 * @param {*} req
 * @param {*} res
 * @returns
 */
export let getAllBooks = async (req, res, next) => {
  try {
    const results = await findAllBooks();

    if (results.length === 0) {
      const error = new Error("Une erreur est survenue lors de la récupération de la liste des livres");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      booksList: results,
    });
  } catch (error) {
    next(error);
  }
};

/**
 *
 * @param {*} req
 * @param {*} res
 * @returns
 */
export let searchABookByTitle = async (req, res, next) => {
  try {
    const result = await findBookByTitle(req.params.title);

    if (result.length === 0) {
      const error = new Error("Aucun livre n'est disponible à partir de ce livre");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * @param {*} req
 * @param {*} res
 * @returns
 */
export let searchABookByAuthor = async (req, res, next) => {
  try {
    const result = await findBookByAuthor(req.params.author_name);

    if (result.length === 0) {
      const error = new Error("Aucun livre n'est disponible à partir de cet auteur");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 *
 * @param {*} req
 * @param {*} res
 */
export let createNewBook = async (req, res, next) => {
  try {
    const result = await createANewBook(req.body);

    if (result.lenght === 0) {
      const error = new Error("Impossible d'ajouter ce livre");
      error.statusCode = 404;
      throw error;
    }

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * @param {*} req
 * @param {*} res
 * @returns
 */
export let updateCreatedBook = async (req, res, next) => {
  try {
    const result = await updateAnExistingBook(req.params.book_id, req.body);

    if (result.length === 0) {
      const error = new Error("Impossible de mettre à jour les informations de ce livre");
      error.statusCode = 400;
      throw error;
    }

    res.status(200).json({ updatedBook: result[0] });
  } catch (error) {
    next(error);
  }
};

/**
 *
 * @param {*} req
 * @param {*} res
 */
export let deleteCreatedBook = async (req, res, next) => {
  try {
    const result = await deleteAnExistingBook(req.params.book_id);

    if (result.length === 0) {
      const error = new Error("Impossible de supprimer ce livre");
      error.statusCode = 400;
      throw error;
    }

    res.status(202).json(result);
  } catch (error) {
    next(error);
  }
};
