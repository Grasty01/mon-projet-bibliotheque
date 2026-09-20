"use strict";

/**
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
let logActivity = (req, res, next) => {
  const currentHour = new Date().toLocaleString();
  const httpMethod = req.method;
  const targetUrl = req.url;

  console.log(
    `Heure : [${currentHour}] - Méthode : [${httpMethod}] - URL : [${targetUrl}]`,
  );
  next();
};

export default logActivity;
