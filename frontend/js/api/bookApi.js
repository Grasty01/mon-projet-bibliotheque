"use strict";

const API_BASE_URL = 'http://localhost:3000/api';

/**
 * Récupère toutes les livres
 * @returns 
 */
export async function fetchBooks() {
    const response = await fetch(`${API_BASE_URL}/books`);
    if (!response.ok) throw new Error('Erreur lors de la récupération des livres');
    return await response.json();
}

/**
 * Crée un livre
 * @param {*} bookData 
 * @returns 
 */
export async function createBook(bookData) {
    const response = await fetch(`${API_BASE_URL}/books`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookData)
    });
    if (!response.ok) throw new Error('Erreur lors de la création du livre');
    return await response.json();
}

/**
 * Supprime un livre
 * @param {*} id 
 * @returns 
 */
export async function deleteBook(id) {
    const response = await fetch(`${API_BASE_URL}/books/delete/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Erreur lors de la suppression');
    return true;
}