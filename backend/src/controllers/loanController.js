"use strict";

import {
  getAllLoans,
  createNewLoan,
  getLoanById,
  updateReturnedLoan,
} from "../models/loanModel.js";

import { findMemberById } from "../models/memberModel.js";
import { findBookById, updateBookStatus } from "../models/bookModel.js";

/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
export let getLoans = async (req, res) => {
  try {
    const loans = await getAllLoans();
    res.status(200).json(loans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 *
 * @param {*} req
 * @param {*} res
 * @returns
 */
export let createLoan = async (req, res) => {
  try {
    const bodyRequest = req.body;

    // 1. Vérification de l'adhérent
    const member = await findMemberById(bodyRequest.member_id);

    if (member.length === 0) {
      res
        .status(404)
        .json({ message: "Une erreur est survenue. Membre introuvable" });
      return;
    }

    // 2. Vérification de l'existence du livre
    const book = await findBookById(bodyRequest.book_id);

    if (book.length === 0) {
      res
        .status(404)
        .json({ message: "Une erreur est survenue. Ce livre n'existe pas" });
      return;
    }

    // 3. Vérification de la disponibilité
    if (book[0].book_availability_status === false) {
      res
        .status(400)
        .json({ message: "Action impossible, livre déjà emprunté" });
      return;
    }

    // 4. Validation de la date de retour
    const estimatedReturnDate = bodyRequest.estimated_return_date || bodyRequest.estimatedReturnDate;

    if (!estimatedReturnDate || new Date(estimatedReturnDate) <= new Date()) {
      res
        .status(400)
        .json("La date de retour doit être supérieure à la date d'emprunt");
      return;
    }

    // 5. Création de l'emprunt
    const loan = await createNewLoan(
      member[0].member_id,
      book[0].book_id,
      estimatedReturnDate,
      false,
    );

    // 6. Mise à jour du statut du livre
    const updatedBookStatus = await updateBookStatus(false, book[0].book_id);
    res
      .status(201)
      .json({ message: "Emprunt crée avec succès", loan: loan[0] });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * 1. Vérifie si l'id de l'emprunt existe,
 * 2. Vérifie si le livre n'a déjà été retrouné
 * 3. Modifie les champs is_returned
 * 4. Rendre le livre concerné à nouveau disponible
 * @param {*} req
 * @param {*} res
 * @returns
 */
export let returnLoan = async (req, res) => {
  try {
    const existingLoan = await getLoanById(req.params.loan_id);

    if (existingLoan.length === 0) {
      res
        .status(404)
        .json({ message: "Aucun emprunt n'existe avec cet identifiant" });
      return;
    }

    if (existingLoan[0].is_returned === true) {
      res.status(400).json({ message: "Ce livre a déjà été retourné" });
      return;
    }

    const result = await updateReturnedLoan(true, req.params.loan_id);
    const availableBook = await updateBookStatus(true, existingLoan[0].book_id);

    res.status(200).json({
      updatedLoan: result[0],
      bookHasChanged: availableBook[0],
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
