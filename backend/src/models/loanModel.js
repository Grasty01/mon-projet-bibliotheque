// Emprunts
import { dbConnexion } from "../../config/db.js";
const pool = dbConnexion();

/**
 *
 * @param {*} loanId
 * @returns
 */
export let getLoanById = async (loanId) => {
  try {
    const query = `SELECT * FROM loans WHERE loan_id = $1`;
    const result = await pool.query(query, [loanId]);
    return result.rows;
  } catch (error) {
    throw new Error(`Impossible d'accéder à cet emprunt ${error}`);
  }
};

/**
 *
 * @param {*} data
 * @returns
 */
export let createNewLoan = async (
  memberID,
  bookID,
  estimatedReturnDate,
  isReturned,
) => {
  try {
    const query = `INSERT INTO loans (member_id, book_id, loan_estimated_return_date, is_returned) 
                   VALUES ($1, $2, $3, $4) RETURNING *`;
    const result = await pool.query(query, [
      memberID,
      bookID,
      estimatedReturnDate,
      isReturned,
    ]);
    return result.rows;
  } catch (error) {
    throw new Error(`Impossible d'ajouter cet emprunt ${error}`);
  }
};

/**
 *
 * @param {boolean} isReturnedValue
 * @param {number} loanID
 * @returns
 */
export let updateReturnedLoan = async (isReturnedValue, loanID) => {
  try {
    const query = `UPDATE loans SET is_returned = $1 WHERE loan_id = $2 RETURNING *`;
    const result = await pool.query(query, [isReturnedValue, loanID]);
    return result.rows;
  } catch (error) {
    throw new Error(
      `Une erreur est survenue. Impossible de mettre à jour cet emprunt ${error}`,
    );
  }
};
