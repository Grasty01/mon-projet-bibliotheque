import { fetchAuthors, createAuthor, deleteAuthor } from '../api/authorApi.js';

/**
 * Vérifie si on n'est pas sur la page auteurs ou pas. 
 * Met à jour le tableau HTML
 * @returns 
 */
export async function renderAuthorsTable() {
    const tableBody = document.getElementById('authors-table-body');
    if (!tableBody) return;

    try {
        const authors = await fetchAuthors();
        tableBody.innerHTML = '';

        authors.forEach(author => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${author.author_id}</td>
                <td>${author.author_name}</td>
                <td>${author.author_nationality || '-'}</td>
                <td>
                    <button class="btn-delete-author" data-id="${author.author_id}" style="color: var(--danger-color); cursor:pointer; background:none; border:none;">Supprimer</button>
                </td>
            `;
            tableBody.appendChild(row);
        });

        // Attachement des écouteurs d'événements sur les nouveaux boutons de suppression
        document.querySelectorAll('.btn-delete-author').forEach(button => {
            button.addEventListener('click', async (e) => {
                const id = e.target.getAttribute('data-id');
                if (confirm("Êtes-vous sûr de vouloir supprimer cet auteur ?")) {
                    try {
                        await deleteAuthor(id);
                        renderAuthorsTable(); // On rafraîchit le tableau après suppression
                    } catch (error) {
                        alert("Erreur lors de la suppression.");
                    }
                }
            });
        });

    } catch (error) {
        console.error(error);
        tableBody.innerHTML = '<tr><td colspan="4">Erreur de chargement des données.</td></tr>';
    }
}

/**
 * Initialise le formulaire de création
 * @returns 
 */
export function initAuthorForm() {
    const form = document.getElementById('create-author-form');
    const messageEl = document.getElementById('form-message');

    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const authorData = {
            name: `${document.getElementById('first_name').value} ${document.getElementById('last_name').value}`,
            nationality: document.getElementById('nationality').value
        };

        try {
            await createAuthor(authorData);
            messageEl.textContent = "Auteur enregistré avec succès !";
            messageEl.style.color = "green";
            form.reset();
            renderAuthorsTable();
        } catch (error) {
            messageEl.textContent = "Erreur lors de l'enregistrement.";
            messageEl.style.color = "var(--danger-color)";
        }

        setTimeout(() => { messageEl.textContent = ''; }, 3000);
    });
}