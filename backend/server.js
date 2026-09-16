//Point d'entrée principal qui lance le serveur
"use strict";

import authorRouter from "./src/routes/authorRoutes.js";
import express from "express";

const app = express();

app.use("/api/authors", authorRouter);

app.listen(3000, () => {
  console.log("Le serveur écoute sur le port http://localhost:3000");
});
