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
 * Le middleware qui affiche les logs dans la console
 */
app.use(logActivity);

/**
 * Autorise le frontend à communiquer avec l'API.
 */
app.use(cors());

/**
 * Permet de parser le corps de la requette afin de récupérer les données lisibles
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
 * Middleware global de gestion d'erreur
 * 1. Log de l'erreur pour toi (côté serveur)
 * 2. Définition du code de statut (500 par défaut si non spécifié)
 * 3. Renvoi d'une réponse JSON propre au client
 */
app.use((err, req, res, next) => {
  console.error(err.statck);

  const errorStatus = err.statusCode || 500;

  res.status(errorStatus).json({
    status: "error",
    statusCode: errorStatus,
    message: err.message || "Erreur internet du serveur rencontré"
  })
})

/**
 * Démarrage du serveur
 */
app.listen(serverPort, () => {
  console.log(`Le serveur écoute sur le port http://localhost:${serverPort}`);
});
