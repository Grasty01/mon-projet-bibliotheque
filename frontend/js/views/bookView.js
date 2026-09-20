"use strict";

import { fetchBooks, createBook, deleteBook } from '../api/bookApi.js';
import { fetchAuthors } from '../api/authorApi.js'; // Pour le <select>

/**
 * 
 * @returns 
 */
export async function renderBooksTable() {
    const tableBody = document.getElementById('books-table-body');
    if (!tableBody) return;

    try {
        const response = await fetchBooks();
        const books = response.booksList || response;
        tableBody.innerHTML = '';

        books.forEach(book => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${book.book_id}</td>
                <td>${book.book_title}</td>
                <td>${book.author_id}</td>
                <td>${book.book_year_of_publication || '-'}</td>
                <td>${book.book_availability_status ? 'Disponible' : 'Emprunté'}</td>
                <td>
                    <button class="btn-delete-book" data-id="${book.book_id}" style="color: var(--danger-color); cursor:pointer; background:none; border:none;">Supprimer</button>
                </td>
            `;
            tableBody.appendChild(row);
        });

        document.querySelectorAll('.btn-delete-book').forEach(button => {
            button.addEventListener('click', async (e) => {
                if (confirm("Supprimer ce livre ?")) {
                    await deleteBook(e.target.getAttribute('data-id'));
                    renderBooksTable();
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
export async function initBookForm() {
    const form = document.getElementById('create-book-form');
    const authorSelect = document.getElementById('author_id');
    if (!form) return;

    // Remplir la liste déroulante des auteurs
    try {
        const authors = await fetchAuthors();
        authors.forEach(author => {
            const option = document.createElement('option');
            option.value = author.author_id;
            option.textContent = author.author_name;
            authorSelect.appendChild(option);
        });
    } catch (error) {
        console.error("Impossible de charger les auteurs pour le select");
    }

    // Gestion de la soumission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const messageEl = document.getElementById('form-message');

        try {
            await createBook({
                bookTitle: document.getElementById('title').value,
                authorId: document.getElementById('author_id').value,
                yearOfPublication: document.getElementById('published_year').value,
                bookAvailabilityStatus: true
            });
            messageEl.textContent = "Livre enregistré !";
            messageEl.style.color = "green";
            form.reset();
            renderBooksTable();
        } catch (error) {
            messageEl.textContent = "Erreur d'enregistrement.";
            messageEl.style.color = "var(--danger-color)";
        }
        setTimeout(() => messageEl.textContent = '', 3000);
    });
}