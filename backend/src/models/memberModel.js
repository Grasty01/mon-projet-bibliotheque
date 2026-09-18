//Adhérents
"use strict";

import { dbConnexion } from "../../config/db.js";
const pool = dbConnexion();

/**
 * Find a member by his id
 * @param {*} memberId
 * @returns
 */
let findMemberById = async (memberId) => {
  try {
    const query = `SELECT * FROM members WHERE member_id = $1`;
    const result = await pool.query(query, [memberId]);
    return result.rows;
  } catch (error) {
    throw new Error(
      `Impossible d'accéder aux informations de cet utilisateur ${error}`,
    );
  }
};

/**
 * Récupère tous les membres
 * @returns all members in database
 */
export let findAllMembers = async () => {
  try {
    const query = "SELECT * FROM members";
    const results = await pool.query(query);

    return results.rows;
  } catch (error) {
    throw new Error(
      `Impossible de récupérer la liste des membres dans la base de données. ${error}`,
    );
  }
};

/**
 *
 * @param {object} data
 * @returns new member
 */
export let createNewMember = async (data) => {
  try {
    const query = `INSERT INTO members(member_firstname, member_lastname, member_email, member_address, member_contact) 
                   VALUES($1, $2, $3, $4, $5) 
                   RETURNING *
                   `;
    const queryArrayParams = [
      data.firstname,
      data.lastname,
      data.email,
      data.address,
      data.contact,
    ];
    const result = await pool.query(query, queryArrayParams);
    return result.rows;
  } catch (error) {
    throw new Error(`Impossible de créer cet utilisateur ${error}`);
  }
};

/**
 *
 * @param {object} data
 * @returns
 */
export let updateExistingMember = async (memberId, data) => {
  try {
    /**
     * Vérifie d'abord que le membre qui doit être modifié existe bien dans la base de donnée
     */
    const memberToBeUpdated = await findMemberById(memberId);
    const query = `UPDATE members 
                   SET member_firstname = $1, member_lastname = $2, member_email = $3, 
                   member_address = $4, member_contact = $5 WHERE member_id = $6
                   RETURNING *
                   `;
    const queryArrayParams = [
      data.firstname,
      data.lastname,
      data.email,
      data.address,
      data.contact,
      memberToBeUpdated[0].member_id,
    ];
    const updatedMember = await pool.query(query, queryArrayParams);
    return updatedMember.rows;
  } catch (error) {
    throw new Error(
      `Impossible de modifier les informations de ce membre ${error}`,
    );
  }
};

/**
 *
 * @param {*} memberId
 * @returns
 */
export let deleteExistingMembber = async (memberId) => {
  try {
    //Vérifie d'abord que le membre qui doit être supprimé existe bien dans la base de donnée
    const memberToBeDeleted = await findMemberById(memberId);
    const query = `DELETE FROM members WHERE member_id = $1 RETURNING *`;
    const result = await pool.query(query, [memberToBeDeleted[0].member_id]);

    return result.rows;
  } catch (error) {
    throw new Error(`Impossible de supprimer cet utilisateur ${error}`);
  }
};
