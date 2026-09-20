//Point d'entrée principal qui lance le serveur
"use strict";

import authorRouter from "./src/routes/authorRoutes.js";
import memberRouter from "./src/routes/memberRoutes.js";
import bookRouter from "./src/routes/bookRoutes.js";
import loanRouter from "./src/routes/loanRoutes.js";
import dashboardRouter from "./src/routes/dashboardRoutes.js";
import logActivity from "./src/middlewares/loggerMiddleware.js";
import express from "express";
import cors from "cors";

const app = express();
const serverPort = 3000;

/**
 * Autorise le frontend local à communiquer avec l'API.
 */
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

/**
 * Le middleware qui affiche les logs dans la console
 */
app.use(logActivity);

/**
 * Le middleware permettant a express d'accepter des requettes http provenant du frontend
 */
app.use(cors());

/**
 * Permet de parser le corps de la requette afin d'avoir de récupérer les données
 */
app.use(express.json());

/**
 * Router pour l'entité author
 */
app.use("/api/authors", authorRouter);

/**
 * Route pour l'entité member (adhérent)
 */
app.use("/api/members", memberRouter);

/**
 * Route pour l'entité book (livre)
 */
app.use("/api/books", bookRouter);

/**
 * Crée un nouvel umprunt
 */
app.use("/api/loans", loanRouter);

/**
 * Affiche les states
 */
app.use("/api/dashboard", dashboardRouter);

/**
 * Démarrage du serveur
 */
app.listen(serverPort, () => {
  console.log(`Le serveur écoute sur le port http://localhost:${serverPort}`);
});
