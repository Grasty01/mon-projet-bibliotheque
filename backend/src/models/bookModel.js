//Livres
import { dbConnexion } from "../../config/db.js";
const pool = dbConnexion();

/**
 *
 * @returns
 */
export let findAllBooks = async () => {
  try {
    const query = `SELECT * FROM books;`;
    const results = await pool.query(query);
    return results.rows;
  } catch (error) {
    throw new Error(
      `Oups, impossible d'accéder à la liste de tous les livres ${error}`,
    );
  }
};

/**
 *
 * @param {*} bookTitle
 * @returns
 */
export let findBookByTitle = async (bookTitle) => {
  try {
    const query = `SELECT * FROM books WHERE book_title = $1`;
    const result = await pool.query(query, [bookTitle]);
    return result.rows;
  } catch (error) {
    throw new Error(`Oups, la recherche sur ce livre n'a rien donnée ${error}`);
  }
};

/**
 *
 * @param {*} authorName
 * @returns
 */
export let findBookByAuthor = async (authorName) => {
  try {
    const query = `SELECT *, authors.author_name, author_nationality 
                   FROM books JOIN authors 
                   ON books.author_id = authors.author_id 
                   WHERE authors.author_name = $1;`;
    const results = await pool.query(query, [authorName]);
    return results.rows;
  } catch (error) {
    throw new Error(`Oups, aucun auteur n'a été trouvé avec ce nom`);
  }
};

/**
 *
 * @param {*} data
 * @returns
 */
export let createANewBook = async (data) => {
  try {
    const createBookQuery = `INSERT INTO books (book_title, author_id, book_year_of_publication, book_availability_status) 
                             VALUES ($1, $2, $3, $4) RETURNING *`;
    const newCreatedBook = await pool.query(createBookQuery, [
      data.bookTitle,
      data.authorId,
      data.yearOfPublication,
      data.bookAvailabilityStatus,
    ]);

    return newCreatedBook.rows;
  } catch (error) {
    throw new Error(
      `Oups, une erreur est survenue lors du processus de création d'un livre`,
    );
  }
};

/**
 *
 * @param {*} authorId
 * @param {*} bookId
 * @param {*} data
 * @returns
 */
export let updateAnExistingBook = async (bookId, data) => {
  try {
    const bookUpdateQuery = `UPDATE books 
                             SET book_title = $1, 
                             book_year_of_publication = $2, book_availability_status = $3 
                             WHERE book_id = $4 RETURNING *`;

    const newBookResult = await pool.query(bookUpdateQuery, [
      data.bookTitle,
      data.yearOfPublication,
      data.bookAvailabilityStatus,
      bookId,
    ]);

    return newBookResult.rows;
  } catch (error) {
    throw new Error(
      `Une erreur s'est produite lors de la modification des informations sur ce livre ${error}`,
    );
  }
};

/**
 *
 * @param {*} bookId
 * @returns
 */
export let deleteAnExistingBook = async (bookId) => {
  try {
    const query = `DELETE FROM books WHERE book_id = $1 RETURNING *`;
    const result = await pool.query(query, [bookId]);
    return result.rows;
  } catch (error) {
    throw new Error(`Impossible de supprimer ce livre ${error}`);
  }
};
