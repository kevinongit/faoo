const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];
  if (token === "Bearer mock_access_token") {
    next();
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
};

module.exports = verifyToken;
