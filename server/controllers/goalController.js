import pool from "../config/db.js";

// CREATE GOALS
export const createGoal = async (req, res) => {
  const { title, description } = req.body;
  const userId = req.user.id; //from protect middleware

  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO goals (title,description,creator_id) VALUES ($1,$2,$3)",
      [title, description, userId]
    );

    const newGoal = result.rows[0];
    res.status(201).json(newGoal);
  } catch (err) {
    console.error("Error creating goal:", err);
    res.status(500).json({ error: "Failed to create goal" });
  }
};

// DISPLAY GOALS
export const getGoals = async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await pool.query(
      "SELECT g.* FROM goals g LEFT JOIN goal_collaborators gc ON g.id = gc.goal_id WHERE g.creator_id = $1 OR gc.user_id = $1 ORDER BY g.created_at DESC",
      [userId]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching goals:", err);
    res.status(500).json({ error: "Failed to fetch goals" });
  }
};
