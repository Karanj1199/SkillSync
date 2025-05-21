import app from "./app.js";
import pool from "./config/db.js";
import http from "http";
import dotenv from "dotenv";

dotenv.config();

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
