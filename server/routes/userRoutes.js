import express from "express";
import protect from "../middleware/authMiddleware.js";
import upload from "../config/multer.js";
import pool from "../config/db.js";

const router = express.Router();

//Protected route (example)
router.get("/me", protect, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id,name,email,role,profile_pic,created_at FROM users WHERE id = $1",
      [req.user.id]
    );

    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

router.post(
  "/upload",
  protect,
  upload.single("file"), //name of the input field
  async (req, res) => {
    try {
      const filename = req.file.filename;
      const userId = req.user.id;

      //Save to database
      await pool.query("UPDATE users SET profile_pic = $1 WHERE id = $2", [
        filename,
        userId,
      ]);
      res.status(200).json({
        message: "File uploaded successfully",
        file: req.file.filename,
      });
    } catch (err) {
      console.error("Upload error:", err);
      res.status(500).json({ error: "Server error while saving file" });
    }
  }
);

//Update name,email or profile_pic
router.post("/me", protect, async (req, res) => {
  const { name, email, profile_pic } = req.body;

  try {
    const result = await pool.query(
      "UPDATE users SET name = $1,email=$2,profile_pic=$3 WHERE id = $4 RETURNING id,name,email,role,profile_pic,created_at",
      [name, email, profile_pic, req.user.id]
    );

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("Update user error:", err);
    res.status(500).json({ error: "Failed to update user profile" });
  }
});

export default router;
