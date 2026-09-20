"use strict";

import { fetchLoans, createLoan, returnLoan } from '../api/loanApi.js';
import { fetchMembers } from '../api/memberApi.js'; // Pour le select
import { fetchBooks } from '../api/bookApi.js';     // Pour le select

/**
 * 
 * @returns 
 */
export async function renderLoansTable() {
    const tableBody = document.getElementById('loans-table-body');
    if (!tableBody) return;

    try {
        const loans = await fetchLoans();
        tableBody.innerHTML = '';

        loans.forEach(loan => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${loan.loan_id}</td>
                <td>${loan.member_id}</td>
                <td>${loan.book_id}</td>
                <td>${loan.loan_estimated_return_date}</td>
                <td>${loan.is_returned ? 'Retourné' : 'En cours'}</td>
                <td>
                    ${loan.is_returned ? '-' : `<button class="btn-delete-loan" data-id="${loan.loan_id}" style="color: var(--danger-color); cursor:pointer; background:none; border:none;">Terminer</button>`}
                </td>
            `;
            tableBody.appendChild(row);
        });

        document.querySelectorAll('.btn-delete-loan').forEach(button => {
            button.addEventListener('click', async (e) => {
                if (confirm("Clôturer cet emprunt ?")) {
                    await returnLoan(e.target.getAttribute('data-id'));
                    renderLoansTable();
                }
            });
        });
    } catch (error) {
        tableBody.innerHTML = '<tr><td colspan="6">Erreur de chargement.</td></tr>';
    }
}

/**
 * 
 * @returns 
 */
export async function initLoanForm() {
    const form = document.getElementById('create-loan-form');
    const memberSelect = document.getElementById('member_id');
    const bookSelect = document.getElementById('book_id');
    if (!form) return;

    // Remplir les listes déroulantes
    try {
        const [members, membersBooks] = await Promise.all([fetchMembers(), fetchBooks()]);
        const books = membersBooks.booksList || membersBooks;

        members.forEach(member => {
            const option = document.createElement('option');
            option.value = member.member_id;
            option.textContent = `${member.member_firstname} ${member.member_lastname}`;
            memberSelect.appendChild(option);
        });

        books.forEach(book => {
            const option = document.createElement('option');
            option.value = book.book_id;
            option.textContent = book.book_title;
            bookSelect.appendChild(option);
        });
    } catch (error) {
        console.error("Erreur de chargement des listes (membres/livres)");
    }

    // Gestion de la soumission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const messageEl = document.getElementById('form-message');

        try {
            await createLoan({
                member_id: document.getElementById('member_id').value,
                book_id: document.getElementById('book_id').value,
                estimated_return_date: document.getElementById('estimated_return_date').value
            });
            messageEl.textContent = "Emprunt enregistré !";
            messageEl.style.color = "green";
            form.reset();
            renderLoansTable();
        } catch (error) {
            messageEl.textContent = "Erreur d'enregistrement.";
            messageEl.style.color = "var(--danger-color)";
        }
        setTimeout(() => messageEl.textContent = '', 3000);
    });
}