//Point d'entrée principal qui lance le serveur
"use strict";

import express from "express";
import authorRouter from "./src/routes/authorRoutes.js";
import memberRouter from "./src/routes/memberRoutes.js";
import bookRouter from "./src/routes/bookRoutes.js";
//import loanRouter from "./src/routes/loanRoutes.js";

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
 * Route pour l'entité member (adhérent)
 */
app.use("/api/members", memberRouter);

/**
 * Route pour l'entité book (livre)
 */
app.use("/api/books", bookRouter);

/**
 * Démarrage du serveur
 */
app.listen(serverPort, () => {
  console.log(`Le serveur écoute sur le port http://localhost:${serverPort}`);
});
