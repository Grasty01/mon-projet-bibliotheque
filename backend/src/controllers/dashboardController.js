"use strict";

import { getTotalBooks, getTotalMembers, getNumberCurrentLoan, getNumberOfOverdueLoan, getMostBorrowedBook, getMostActiveMember } from "../models/dashboardModel.js";

/**
 * Utilisation de Promise.all pour une exécution indépenante.
 * Ce qui diminue le temps d'exécution des requettes
 * Count sur Postgresql renvoie toujours une chaine de caractère au
 * format JSON sous la clé count. Conversion de string en integrer
 * @param {*} req
 * @param {*} res
 */
export let getDashboardStats = async (req, res) => {
  try {
    const [totalBooks, totalMembers, numberCurrentLoan, numberOfOverdueLoan,
      mostBorrowedBook, mostActiveMember] = await Promise.all([getTotalBooks(),
      getTotalMembers(), getNumberCurrentLoan(), getNumberOfOverdueLoan(),
      getMostBorrowedBook(), getMostActiveMember()]);

    /**
     *
     * */
    res.status(200).json({
      total_books: parseInt(totalBooks[0].count),
      total_members: parseInt(totalMembers[0].count),
      number_current_loan: parseInt(numberCurrentLoan[0].count),
      number_of_overdue_loan: parseInt(numberOfOverdueLoan[0].count),
      most_borrowed_book: mostBorrowedBook[0],
      most_active_member: mostActiveMember[0],
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
