const jwt = require("jsonwebtoken");
const User = require("../models/user");

module.exports = async (req, res, next) => {
  try {
    const token = req.header("Authorization");

    if (!token) {
      return res.status(401).json({
        message: "Token missing"
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findByPk(decoded.userId);

    if (!user) {
      return res.status(401).json({
        message: "User not found"
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log("Auth error:", error.message);
    return res.status(401).json({
      message: "Invalid token"
    });
  }
};