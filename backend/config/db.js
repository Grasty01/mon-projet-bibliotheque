import { Pool } from "pg";

const host = "localhost";
const user = "postgres";
const dbName = "library_db";
const password = "1234Admin";
const port = 5432;

export let dbConnexion = () => {
  const pool = new Pool({
    host: host,
    user: user,
    port: port,
    database: dbName,
    password: password,
  });

  return pool;
};
