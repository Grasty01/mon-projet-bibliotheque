//Point d'entrée principal qui lance le serveur
"use strict";

import authorRouter from "./src/routes/authorRoutes.js";
import express from "express";

const app = express();
const serverPort = 3000;

/**
 * Permet de parser le corps de la requette afin d'avoir de récupérer les données
 */
app.use(express.json());

/**
 * Router pour l'entité author
 */
app.use("/api/authors", authorRouter);

/**
 * Démarrage du serveur
 */
app.listen(serverPort, () => {
  console.log(`Le serveur écoute sur le port http://localhost:${serverPort}`);
});
