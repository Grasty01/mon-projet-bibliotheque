"use strict";

import { fetchMembers, createMember, deleteMember } from '../api/memberApi.js';

/**
 * Affiche le rendu des données dans la table membres
 * @returns 
 */
export async function renderMembersTable() {
    const tableBody = document.getElementById('members-table-body');
    if (!tableBody) return;

    try {
        const members = await fetchMembers();
        tableBody.innerHTML = '';

        members.forEach(member => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${member.member_id}</td>
                <td>${member.member_firstname}</td>
                <td>${member.member_lastname}</td>
                <td>${member.member_email}</td>
                <td>${member.member_address || '-'}</td>
                <td>${member.member_contact || '-'}</td>
                <td>
                    <button class="btn-delete-member" data-id="${member.member_id}" style="color: var(--danger-color); 
                    cursor:pointer; background:none; border:none;">Supprimer</button>
                </td>
            `;
            tableBody.appendChild(row);
        });

        document.querySelectorAll('.btn-delete-member').forEach(button => {
            button.addEventListener('click', async (e) => {
                if (confirm("Supprimer cet adhérent ?")) {
                    await deleteMember(e.target.getAttribute('data-id'));
                    renderMembersTable();
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
export function initMemberForm() {
    const form = document.getElementById('create-member-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const messageEl = document.getElementById('form-message');

        try {
            await createMember({
                firstname: document.getElementById('first_name').value,
                lastname: document.getElementById('last_name').value,
                email: document.getElementById('email').value,
                address: document.getElementById('address').value,
                contact: document.getElementById('contact').value
            });
            messageEl.textContent = "Adhérent enregistré !";
            messageEl.style.color = "green";
            form.reset();
            renderMembersTable();
        } catch (error) {
            messageEl.textContent = "Erreur d'enregistrement.";
            messageEl.style.color = "var(--danger-color)";
        }
        setTimeout(() => messageEl.textContent = '', 3000);
    });
}