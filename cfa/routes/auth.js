const express = require("express");
const router = express.Router();

router.post("/token", (req, res) => {
  res.json({
    access_token: "mock_access_token",
    token_type: "bearer",
    expires_in: 86400,
    scope: "apig",
  });
});

module.exports = router;
