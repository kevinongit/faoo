const express = require('express');
const data = require('../data/data.json');
const logger = require('../utils/logger');

function createChatRouter(io) {
  const router = express.Router();

  router.get('/chat-list/:userId', (req, res) => {
    logger.info('Fetching chat list');
    const { userId } = req.params;
    logger.info(`Fetching chat list for user: ${userId}`);

    const chatList = data.chatLists[userId] || [];
    res.json(chatList);
  });

  router.post('/send-message', (req, res) => {
    const { from, to, content, type } = req.body;

    if (!from || !to || !content || !type) {
      logger.error('Missing required fields in send-message request');
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const message = {
      from,
      to,
      content,
      type,
      timestamp: new Date().toISOString(),
      read: false
    };

    logger.info(`New message sent from ${from} to ${to}`);

    // Socket.IO를 사용하여 수신자에게 실시간으로 메시지 전송
    io.to(to).emit('new-message', message);

    res.status(200).json({ success: true, message: 'Message sent successfully' });
  });

  router.post('/mark-as-read', (req, res) => {
    const { userId, chatId, messageIds } = req.body;

    // 메시지 읽음 처리 로직
    messageIds.forEach(messageId => {
      // 데이터베이스에서 해당 메시지의 read 상태를 true로 업데이트
    });

    // 읽음 처리된 최신 메시지 ID를 채팅방의 lastReadMessage로 업데이트
    updateLastReadMessage(userId, chatId, messageIds[messageIds.length - 1]);

    io.to(chatId).emit('messages-read', { userId, messageIds });
    res.status(200).json({ success: true, message: 'Messages marked as read' });
    logger.info(`Messages marked as read for user ${userId} in chat ${chatId}`);
  });

  // New endpoint: Set unreadCount to 0 for a specific chat (selected chat partner)
  router.post('/allread', (req, res) => {
    const { userId, chatId } = req.body;
    if (!userId || !chatId) {
      logger.error('Missing required fields in allread request');
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Retrieve the user's chat list from the in-memory database
    const userChatList = data.chatLists[userId] || [];
    let found = false;

    // Update unreadCount to 0 for the chat where chat.with matches chatId
    const updatedChatList = userChatList.map(chat => {
      if (chat.with === chatId) {
        found = true;
        logger.info(`Resetting unreadCount for user ${userId} chat with ${chatId}`);
        return { ...chat, unreadCount: 0 };
      }
      return chat;
    });

    if (!found) {
      logger.error(`Chat with ${chatId} not found for user ${userId}`);
      return res.status(404).json({ error: 'Chat not found' });
    }

    // Update the in-memory data (if needed, update your persistent storage instead)
    data.chatLists[userId] = updatedChatList;

    // Optionally, inform the client(s) via socket.io that messages have been marked as read
    io.to(chatId).emit('messages-read', { userId, chatId });
    res.status(200).json({ success: true, message: 'All messages marked as read' });
  });

  return router;
}



function updateLastReadMessage(userId, chatId, messageId) {
  // 데이터베이스에서 사용자의 해당 채팅방 lastReadMessage 업데이트
}

module.exports = createChatRouter;
