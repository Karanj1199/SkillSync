import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

const app = express();
dotenv.config();

//Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
// Routes placeholder
app.get("/", (req, res) => {
  res.send("Welcome to Skillsync API!");
});

export default app;
