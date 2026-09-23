"use strict";

import { findAllMembers, createNewMember, updateExistingMember, deleteExistingMembber } from "../models/memberModel.js";

/**
 *
 * @param {*} req
 * @param {*} res
 */
export let getAllMembers = async (req, res, next) => {
  try {
    const membersList = await findAllMembers();
    console.log(membersList.length);

    if (membersList.length === 0) {
      const error = new Error("Impossible de récupérer la liste des membres");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json(membersList);
  } catch (error) {
    next(error);
  }
};

/**
 *
 * @param {*} req
 * @param {*} res
 */
export let getAllOfLoansMember = (req, res) => {
  res.json({
    message: "Voici la liste des emprunts passés et en cours de cet membre",
  });
};

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
export let createMember = async (req, res, next) => {
  try {
    const newMember = await createNewMember(req.body);

    if (!newMember[0]) {
      const error = new Error("Impossible de créer ce membre");
      error.statusCode = 400;
      throw error;
    }

    res.status(201).json({
      message: "Utilisateur créé avec succès",
      newMember: newMember,
    });

  } catch (error) {
    next(error);
  }
};

/**
 *
 * @param {*} req
 * @param {*} res
 * @returns
 */
export let updateMember = async (req, res, next) => {
  try {
    const memberToBeUpdated = await updateExistingMember(req.params.id, req.body);

    if (!memberToBeUpdated[0]) {
      const error = new Error("Impossible de mettre à jour les informations de ce membre");
      error.statusCode = 400;
      throw error;
    }

    res.status(200).json({
      message: "Les informations de cet adhérents ont été modifiées avec succès",
      updatedMember: memberToBeUpdated[0],
    });

  } catch (error) {
    next(error);
  }
};

/**
 *
 * @param {*} req
 * @param {*} res
 * @returns
 */
export let deleteMember = async (req, res, next) => {
  try {
    const result = await deleteExistingMembber(req.params.id);

    if (!result[0]) {
      const error = new Error("Impossible de supprimer ce membre");
      error.statusCode = 400;
      throw error;
    }

    res.status(200).json({
      message: "Utilisateur supprimé avec succès",
      memberWasDeleted: result[0],
    });
  } catch (error) {
    next(error);
  }
};
