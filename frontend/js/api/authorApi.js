const API_BASE_URL = 'http://localhost:3000/api';

/**
 * Récupérer tous les auteurs (GET)
 * @returns 
 */
export async function fetchAuthors() {
    const response = await fetch(`${API_BASE_URL}/authors`);
    if (!response.ok) throw new Error('Erreur lors de la récupération des auteurs');
    return await response.json();
}

/**
 * Créer un nouvel auteur (POST)
 * @param {*} authorData 
 * @returns 
 */
export async function createAuthor(authorData) {
    const response = await fetch(`${API_BASE_URL}/authors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authorData)
    });
    if (!response.ok) throw new Error('Erreur lors de la création de l\'auteur');
    return await response.json();
}

/**
 * Supprimer un auteur (DELETE)
 * @param {*} id 
 * @returns 
 */
export async function deleteAuthor(id) {
    const response = await fetch(`${API_BASE_URL}/authors/${id}`, {
        method: 'DELETE'
    });
    if (!response.ok) throw new Error('Erreur lors de la suppression de l\'auteur');
    return true;
}