"use strict";

const API_BASE_URL = 'http://localhost:3000/api';

export async function fetchMembers() {
    const response = await fetch(`${API_BASE_URL}/members`);
    if (!response.ok) throw new Error('Erreur lors de la récupération des adhérents');
    return await response.json();
}

/**
 * Crée un membre
 * @param {*} memberData 
 * @returns 
 */
export async function createMember(memberData) {
    const response = await fetch(`${API_BASE_URL}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(memberData)
    });
    if (!response.ok) throw new Error('Erreur lors de la création de l\'adhérent');
    return await response.json();
}

/**
 * Suprime un membre
 * @param {*} id 
 * @returns 
 */
export async function deleteMember(id) {
    const response = await fetch(`${API_BASE_URL}/members/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Erreur lors de la suppression');
    return true;
}