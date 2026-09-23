"use strict";

import { findAllAuthors, creatAnAuthor, updateAnExistingAuthor, deletAnExistingAuthor } from "../models/authorModel.js";

/**
 * Return all authors on datablase
 * @param {*} req
 * @param {*} res
 */
export let getAllAuthors = async (req, res, next) => {
	try {
		const results = await findAllAuthors();

		if (results.rows === 0) {
			const error = new Error("La liste des auteurs est introuvables");
			error.statusCode = 404;
			throw error;
		}

		res.status(200).json(results);
	} catch (error) {
		next(error);
	}
};

/**
 * Create a new author
 * @param {*} req
 * @param {*} res
 */
export let createAuthor = async (req, res, next) => {
	try {
		const bodyOfRequest = req.body;
		const newAuthorCreated = await creatAnAuthor(bodyOfRequest.name, bodyOfRequest.nationality);

		if (!newAuthorCreated) {
			const error = new Error("Impossible de créer cet utilisateur");
			error.statusCode = 400;
			throw error;
		}

		res.status(201).json(newAuthorCreated);
	} catch (error) {
		next(error);
	}
};

/**
 * Update information of an author
 * @param {*} req
 * @param {*} res
 */
export let updateAuthor = async (req, res, next) => {
	try {
		const authorQueryString = req.query;
		const newAuthorWasUpdated = await updateAnExistingAuthor(req.params.id, authorQueryString.name, authorQueryString.nationality,
		);

		if (!newAuthorWasUpdated) {
			const error = new Error("Impossible de mettre à jour cet utilisateur");
			error.statusCode = 400;
			throw error;
		}

		res.status(201).json(newAuthorWasUpdated.rows);
	} catch (error) {
		next(error);
	}
};

/**
 * Delete an author
 * @param {*} req
 * @param {*} res
 */
export let deleteAuthor = async (req, res, next) => {
	try {
		const authorWasDeleted = await deletAnExistingAuthor(req.params.id);

		if (!authorWasDeleted) {
			const error = new Error("Impossible de supprimer cet utilisateur");
			error.statusCode = 400;
			throw error;
		}

		res.status(200).json({
			message: `L'auteur ${authorWasDeleted.rows[0].author_name} a été supprimé avec succès`,
			author: authorWasDeleted.rows,
		});
	} catch (error) {
		next(error);
	}
};
