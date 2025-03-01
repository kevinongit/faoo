const express = require('express');
const router = express.Router();
const data = require('../data/data.json');
const logger = require('../utils/logger');

router.post('/login', (req, res) => {
  const { id, password } = req.body;
  logger.info(`Login attempt for user: ${id}`);

  const user = data.users.find(u => u.id === id && u.password === password);

  if (user) {
    logger.info(`User ${id} logged in successfully`);
    res.json({ success: true, message: 'Login successful' });
  } else {
    logger.warn(`Failed login attempt for user: ${id}`);
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

module.exports = router;
