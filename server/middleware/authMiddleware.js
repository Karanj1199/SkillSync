import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  //Check for token in header
  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return res.status(401).json({ error: "Unauthorized. Token Missing" });
  }

  const token = authHeader.split(" ")[1];

  try {
    //Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    //Attach user info to request
    req.user = decoded;

    //continue to route handler
    next();
  } catch (err) {
    console.error("JWT error:", err);
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

export default protect;
