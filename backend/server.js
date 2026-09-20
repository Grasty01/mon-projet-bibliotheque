//Point d'entrée principal qui lance le serveur
"use strict";

import express from "express";
import authorRouter from "./src/routes/authorRoutes.js";
import memberRouter from "./src/routes/memberRoutes.js";
import bookRouter from "./src/routes/bookRoutes.js";
import loanRouter from "./src/routes/loanRoutes.js";
import dashboardRouter from "./src/routes/dashboardRoutes.js";
import logActivity from "./src/middlewares/loggerMiddleware.js";

const app = express();
const serverPort = 3000;

/**
 * Le middleware qui affiche les logs dans la console
 */
app.use(logActivity);

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
