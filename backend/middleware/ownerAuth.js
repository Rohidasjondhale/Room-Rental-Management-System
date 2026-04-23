module.exports = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized"
      });
    }

    if (req.user.role !== "owner") {
      return res.status(401).json({
        message: "Only owner can add property"
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Unauthorized"
    });
  }
};    