"use strict";

const API_BASE_URL = 'http://localhost:3000/api';

/**
 * 
 * @returns 
 */
export async function fetchDashboardStats() {
    const response = await fetch(`${API_BASE_URL}/dashboard`);
    if (!response.ok) throw new Error('Erreur lors de la récupération des statistiques');
    return await response.json();
}