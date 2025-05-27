import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";
import sendResetEmail from "../utils/sendEmail.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//  Load .env from the parent folder (/SkillSync/.env)
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// const JWT_SECRET = process.env.JWT_SECRET;
const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = "7d";

//********************REGISTER USER******************** */
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    //Check if User exists
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: "Email already in use" });
    }

    //Hash Password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    //Insert new user
    const newUser = await pool.query(
      "INSERT INTO users (name,email,password) VALUES ($1,$2,$3) RETURNING id,name,email,role",
      [name, email, hashedPassword]
    );

    const user = newUser.rows[0];

    //Create JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({ user, token });
  } catch (err) {
    console.log("Registeration error:", err);
    res.status(500).json({ error: "Server error during registeration" });
  }
};

//****************************LOGIN USER******************** */

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    //Find User by email
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    //Compare Passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid Credentials" });
    }

    //Create JWT Token
    const accesToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );

    //Create refresh token
    const refreshToken = jwt.sign({ id: user.id }, process.env.REFRESH_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRY,
    });
    //Store refresh token in DB
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);

    await pool.query(
      "INSERT INTO refresh_tokens (token,user_id,expires_at) VALUES ($1,$2,$3)",
      [refreshToken, user.id, expiryDate]
    );

    //Return both tokens
    const { password: _, ...userInfo } = user;
    res.status(200).json({
      user: userInfo,
      accesToken,
      refreshToken,
    });
  } catch (err) {
    console.log("Login error:", err);
    res.status(500).json({ error: "Server Error during login" });
  }
};

//********************REFRESH TOKEN****************** */
export const refreshToken = async (req, res) => {
  const { token } = req.body;

  if (!token) return res.status(401).json({ error: "Refresh token missing" });

  try {
    //Check if token exists in DB
    const result = await pool.query(
      "SELECT * FROM refresh_tokens WHERE token = $1",
      [token]
    );
    const storedToken = result.rows[0];

    if (!storedToken) {
      return res.status(403).json({ error: "Invalid refresh token" });
    }

    //verify token validity
    const payload = jwt.verify(token, process.env.REFRESH_SECRET);

    //Issue new access token
    const accessToken = jwt.sign(
      { id: payload.id, email: payload.email, role: payload.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.status(200).json({ accessToken });
  } catch (err) {
    console.error("Refresh token error:", err);
    return res.status(403).json({ error: "Invalid or expired refresh token" });
  }
};

//*********************LOGOUT****************** */
export const logoutUser = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: "Refresh token is required" });
  }

  try {
    await pool.query("DELETE FROM refresh_tokens WHERE token = $1", [token]);
    res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ error: "Failed to logout user" });
  }
};

//*********************FORGOT PASSWORD******************* */
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const userRes = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    const user = userRes.rows[0];

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    await sendResetEmail(email, token);

    res.status(200).json({ message: "Reset email sent successfully" });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ error: "Server error during reset email sending" });
  }
};

//****************RESET PASSWORD************ */

export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    //verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    //hash password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    //update in db
    await pool.query("UPDATE users SET password = $1 WHERE id = $2", [
      hashedPassword,
      decoded.id,
    ]);

    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(400).json({ error: "Invalid or expired token" });
  }
};
