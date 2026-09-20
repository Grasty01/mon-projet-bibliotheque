"use strict";

import { renderDashboard } from './views/dashView.js';
import { renderAuthorsTable, initAuthorForm } from './views/authorView.js';
import { renderMembersTable, initMemberForm } from './views/memberView.js';
import { renderBooksTable, initBookForm } from './views/bookView.js';
import { renderLoansTable, initLoanForm } from './views/loanView.js';

/**
 * Entrée principale
 */
document.addEventListener('DOMContentLoaded', () => {
    /**
     * Initialisation globale de la Sidebar pour toutes les pages
     */
    initSidebar();

    /**
     * Page d'accueil (Tableau de bord)
     */
    if (document.querySelector('.board')) {
        renderDashboard();
    }

    /**
     * Page Auteurs
     */
    if (document.getElementById('create-author-form')) {
        renderAuthorsTable();
        initAuthorForm();
    }

    /**
     * Page Adhérents
     */
    if (document.getElementById('create-member-form')) {
        renderMembersTable();
        initMemberForm();
    }

    /**
     * Page Livres
     */
    if (document.getElementById('create-book-form')) {
        renderBooksTable();
        initBookForm();
    }

    /**
     * Page Emprunts
     */
    if (document.getElementById('create-loan-form')) {
        renderLoansTable();
        initLoanForm();
    }
});

/**
 * Fonction pour le menu responsive
 */
function initSidebar() {
    const sidebar = document.querySelector('aside');
    const toggleBtn = document.querySelector('.reduce-menu-icon');

    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('toggled');
        });
    }
}