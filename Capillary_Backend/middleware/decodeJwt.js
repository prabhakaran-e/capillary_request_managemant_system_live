const jwt = require("jsonwebtoken");
const { ACCESS_TOKEN_SECRET } = require("../config/variables");

const authenticateToken = (req, res, next) => {
  const token =
    req.header("Authorization") && req.header("Authorization").split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access token is required" });
  }

  try {
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);

    req.user = decoded;
    console.log("Decoded token",req.user)

    next();
  } catch (err) {
    console.error("Token verification failed:", err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = authenticateToken;
