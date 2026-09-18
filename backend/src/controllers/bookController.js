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
export let getAllBooks = async (req, res) => {
  try {
    const results = await findAllBooks();

    if (results.length === 0) {
      res
        .status(404)
        .json({ message: "Aucune livre trouvée dans la base de donnée" });

      return;
    }

    res.status(200).json({
      booksList: results,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

/**
 *
 * @param {*} req
 * @param {*} res
 * @returns
 */
export let searchABookByTitle = async (req, res) => {
  try {
    const result = await findBookByTitle(req.params.title);

    if (result.length === 0) {
      res
        .status(404)
        .json({ message: "Aucun livre n'a été trouvé à partir de ce titre" });

      return;
    }

    res.status(200).json(result);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

/**
 *
 * @param {*} req
 * @param {*} res
 * @returns
 */
export let searchABookByAuthor = async (req, res) => {
  try {
    const result = await findBookByAuthor(req.params.author_name);

    if (result.length === 0) {
      res
        .status(404)
        .json({ message: "Aucun livre n'a été trouvé à partir de cet auteur" });

      return;
    }

    res.status(200).json(result);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

/**
 *
 * @param {*} req
 * @param {*} res
 */
export let createNewBook = async (req, res) => {
  try {
    const result = await createANewBook(req.body);

    if (result.lenght === 0) {
      res.status(404).json("Impossible de créer ce livre");
      return;
    }

    res.status(201).json(result);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

/**
 *
 * @param {*} req
 * @param {*} res
 * @returns
 */
export let updateCreatedBook = async (req, res) => {
  try {
    const result = await updateAnExistingBook(req.params.book_id, req.body);

    if (result.length === 0) {
      res.status(404).json("Impossible de modifier ce livre");
      return;
    }

    res.status(200).json({ updatedBook: result[0] });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

/**
 *
 * @param {*} req
 * @param {*} res
 */
export let deleteCreatedBook = async (req, res) => {
  try {
    const result = await deleteAnExistingBook(req.params.book_id);

    if (result.length === 0) {
      res.status(404).json("Impossible de supprimer ce livre");
      return;
    }

    res.status(202).json(result);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
