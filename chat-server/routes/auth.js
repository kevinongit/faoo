const express = require('express');
const router = express.Router();
const data = require('../data/data.json');
const logger = require('../utils/logger');
const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

router.post('/login', (req, res) => {
  const { id, password } = req.body;
  logger.info(`Login attempt for user: ${id}`);

  const user = data.users.find(u => u.id === id && u.password === password);

  if (user) {
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET
    );

    console.log(`User ${user.id} logged in`);
    logger.info(`User ${user.id} logged in successfully`);
    res.send({ user: { id: user.id }, token });
  } else {
    logger.warn(`Failed login attempt for user: ${id}`);
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

// New GET interface for authenticated users to retrieve user list
router.get('/users', /* authenticateToken,**/(req, res) => {
  logger.info('Fetching user list');
  const userList = data.users.map(user => ({
    id: user.id,
    name: user.name
  }));

  logger.info(`User requested user list : ${JSON.stringify(userList)}`);
  res.json(userList);
});

module.exports = router;
