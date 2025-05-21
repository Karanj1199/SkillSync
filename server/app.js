import express from "express";
import cors from "cors";
import dotenv from "dotenv";

const app = express();
dotenv.config();

//Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes placeholder
app.get("/", (req, res) => {
  res.send("Welcome to Skillsync API!");
});

export default app;
