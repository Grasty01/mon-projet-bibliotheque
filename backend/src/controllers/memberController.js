"use strict";

import {
  findAllMembers,
  createNewMember,
  updateExistingMember,
  deleteExistingMembber,
} from "../models/memberModel.js";

/**
 *
 * @param {*} req
 * @param {*} res
 */
export let getAllMembers = async (req, res) => {
  try {
    const membersList = await findAllMembers();
    res.status(200).json(membersList);
  } catch (error) {
    res.status(404).json({
      Message: error.message,
    });
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
export let createMember = async (req, res) => {
  try {
    const newMember = await createNewMember(req.body);

    if (!newMember[0]) {
      res.status(404).json({
        message:
          "Une erreur est survenue lors de la création de cet utilisateur. Merci de vérifier les informations.",
      });

      return;
    }

    res.status(201).json({
      message: "Utilisateur créé avec succès",
      newMember: newMember,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

/**
 *
 * @param {*} req
 * @param {*} res
 * @returns
 */
export let updateMember = async (req, res) => {
  try {
    const memberToBeUpdated = await updateExistingMember(
      req.params.id,
      req.body,
    );

    if (!memberToBeUpdated[0]) {
      res.status(404).json({ message: "Cet utilisateur n'existe pas." });
      return;
    }

    res.status(200).json({
      message:
        "Les informations de cet adhérents ont été modifiées avec succès",
      updatedMember: memberToBeUpdated[0],
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

/**
 *
 * @param {*} req
 * @param {*} res
 * @returns
 */
export let deleteMember = async (req, res) => {
  try {
    const result = await deleteExistingMembber(req.params.id);

    if (!result[0]) {
      res.status(404).json({
        message: "Impossible de supprimer cet utilisateur car il n'existe pas.",
      });

      return;
    }

    res.status(200).json({
      message: "Utilisateur supprimé avec succès",
      memberWasDeleted: result[0],
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
