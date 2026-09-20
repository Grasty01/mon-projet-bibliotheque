"use strict";

import { fetchDashboardStats } from '../api/dashApi.js';

/**
 * Récupère les données pour les stats. En cas d'erreur réseau, 
 * on affiche des tirets au lieu de laisser vide
 * 1. On récupère les données du backend
 * 2. Mise à jour des chiffres clés en haut
 * 3. Mise à jour du "Livre le plus emprunté"
 * 4. Mise à jour de "L'adhérent le plus actif"
 */
export async function renderDashboard() {
    // Vérification qu'on est bien sur la page d'accueil
    const boardContainer = document.querySelector('.board');
    if (!boardContainer) return;

    try {
        const stats = await fetchDashboardStats();

        document.querySelector('.board-book-number').textContent = stats.total_books || 0;
        document.querySelector('.board-member-number').textContent = stats.total_members || 0;
        document.querySelector('.board-loan-number').textContent = stats.number_current_loan || 0;
        document.querySelector('.board-late-loan-number').textContent = stats.number_of_overdue_loan || 0;

        if (stats.most_borrowed_book) {
            document.querySelector('.most-popular-book-title').textContent = stats.most_borrowed_book.book_title;
            document.querySelector('.most-popular-book-loan-number').textContent = `${stats.most_borrowed_book.nombre_emprunts} emprunts`;
        } else {
            document.querySelector('.most-popular-book-title').textContent = "Données insuffisantes";
        }

        if (stats.most_active_member) {
            document.querySelector('.most-loan-member-name').textContent = `${stats.most_active_member.member_firstname} ${stats.most_active_member.member_lastname}`;
            document.querySelector('.most-loan-member-name-loan-number').textContent = `${stats.most_active_member.nombre_emprunts} emprunts`;
        } else {
            document.querySelector('.most-loan-member-name').textContent = "Données insuffisantes";
        }

    } catch (error) {
        console.error("Erreur lors du chargement du tableau de bord:", error);
        document.querySelector('.board-book-number').textContent = "-";
        document.querySelector('.board-member-number').textContent = "-";
        document.querySelector('.board-loan-number').textContent = "-";
        document.querySelector('.board-late-loan-number').textContent = "-";
    }
}