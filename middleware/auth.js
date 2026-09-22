// backend/middleware/auth.js
import jwt from "jsonwebtoken";

const auth = (req, res, next) => {
  try {
    const authHeader = req.header("Authorization"); // get header
    if (!authHeader) return res.status(401).json({ message: "No token" });

    // split Bearer token if sent as "Bearer <token>"
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // attach user ID
    next();
  } catch (err) {
  console.error("AUTH ERROR:", err.message);
  res.status(401).json({ message: "Invalid or expired token" });
}
};

export default auth;