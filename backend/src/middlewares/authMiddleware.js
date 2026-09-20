"use strict";

/**
 * S'assurer que seul un bibliothécaire autorisé puisse déclencher un emprunt.
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
let verifyLibrarianRole = (req, res, next) => {
  const token = req.headers.authorization;

  if (token !== "secret-token-biblio") {
    return res
      .status(401)
      .json({ message: "Accès refusé. Vous n'êtes pas autorisé." });
  } else {
    next();
  }
};

export default verifyLibrarianRole;
