"use strict";

const API_BASE_URL = 'http://localhost:3000/api';

/**
 * Récupère la liste des emprunts
 * @returns 
 */
export async function fetchLoans() {
    const response = await fetch(`${API_BASE_URL}/loans`);
    if (!response.ok) throw new Error('Erreur lors de la récupération des emprunts');
    return await response.json();
}

/**
 * Crée un emprunt
 * @param {*} loanData 
 * @returns 
 */
export async function createLoan(loanData) {
    const response = await fetch(`${API_BASE_URL}/loans`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'secret-token-biblio'
        },
        body: JSON.stringify(loanData)
    });
    if (!response.ok) throw new Error('Erreur lors de la création de l\'emprunt');
    return await response.json();
}

/**
 * Supprime un emprunt
 * @param {*} id 
 * @returns 
 */
export async function returnLoan(id) {
    const response = await fetch(`${API_BASE_URL}/loans/${id}/return`, {
        method: 'PUT',
        headers: { Authorization: 'secret-token-biblio' }
    });
    if (!response.ok) throw new Error('Erreur lors du retour du livre');
    return await response.json();
}