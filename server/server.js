import app from "./app.js";
import pool from "./config/db.js";
import http from "http";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//  Load .env from the parent folder (/SkillSync/.env)
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const server = http.createServer(app);

const PORT = process.env.PORT || 5000;

pool
  .connect()
  .then(() => {
    console.log("Connected to PostgreSQL database");
    server.listen(PORT, () => {
      console.log(`Server is running on ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("Error connecting to the database", err);
  });
