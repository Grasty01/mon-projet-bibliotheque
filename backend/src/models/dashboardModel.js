"use strict";

import { dbConnexion } from "../../config/db.js";
const pool = dbConnexion();

/**
 *
 * @returns le nombre de livre
 */
export let getTotalBooks = async () => {
  try {
    const query = `SELECT COUNT(*) FROM books`;
    const results = await pool.query(query);
    return results.rows;
  } catch (error) {
    throw new Error(
      `Impossible de récupérer la liste de tous les livres ${error}`,
    );
  }
};

/**
 *
 * @returns le nombre des membres
 */
export let getTotalMembers = async () => {
  try {
    const query = `SELECT COUNT(*) FROM members`;
    const results = await pool.query(query);
    return results.rows;
  } catch (error) {
    throw new Error(
      `Impossible de récupérer la liste de tous les membres ${error}`,
    );
  }
};

/**
 *
 * @returns le nombre d'emprunts en cours
 */
export let getNumberCurrentLoan = async () => {
  try {
    const query = `SELECT COUNT(*) FROM loans WHERE is_returned = false`;
    const results = await pool.query(query);
    return results.rows;
  } catch (error) {
    throw new Error(`Impossible de récupérer le nombre des emprunts en cours`);
  }
};

/**
 * @returns le nombre des livres dans la date de retour est dépassée
 */
export let getNumberOfOverdueLoan = async () => {
  try {
    const query = `SELECT COUNT(*) FROM loans 
                   WHERE is_returned = false AND loan_estimated_return_date < CURRENT_DATE
                  `;
    const results = await pool.query(query);
    return results.rows;
  } catch (error) {
    throw new Error(
      `Impossible de récupérer le nombre de livre en retard ${error}`,
    );
  }
};

/**
 * Récupère le titre du livre le plus emprunté
 */
export let getMostBorrowedBook = async () => {
  try {
    const query = `SELECT books.book_title, COUNT(loans.loan_id) AS nombre_emprunts 
                   FROM books JOIN loans ON loans.book_id = books.book_id 
                   GROUP BY books.book_title
                   ORDER BY nombre_emprunts DESC 
                   LIMIT 1
                   `;
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    throw new Error(`Impossible de récupérer le liste le plus emprunté`);
  }
};

/**
 *
 * @returns le membre le plus actif c'est-à-dire avec les plus d'emprunts
 */
export let getMostActiveMember = async () => {
  try {
    const query = `SELECT members.member_id, members.member_firstname, members.member_lastname, COUNT(loans.loan_id) AS nombre_emprunts
                   FROM members
                   JOIN loans ON members.member_id = loans.member_id
                   GROUP BY members.member_id
                   ORDER BY nombre_emprunts DESC 
                   LIMIT 1
                   `;
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    throw new Error(
      `Une erreur est survenue. Impossible de récupérer le membre le plus actif ${error}`,
    );
  }
};
