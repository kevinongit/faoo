const express = require('express');
const router = express.Router();
const data = require('../data/data.json');
const logger = require('../utils/logger');

router.get('/chat-list/:userId', (req, res) => {
  const { userId } = req.params;
  logger.info(`Fetching chat list for user: ${userId}`);

  const chatList = data.chatLists[userId] || [];
  res.json(chatList);
});

module.exports = router;
