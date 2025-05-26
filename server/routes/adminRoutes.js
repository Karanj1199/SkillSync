import express from "express";
import protect from "../middleware/authMiddleware.js";
import isAdmin from "../middleware/isAdmin.js";

const router = express.Router();

router.get("/dashboard", protect, isAdmin, (req, res) => {
  res.json({
    message: "Welcome to the admin dashboard",
    admin: req.user,
  });
});

export default router;
