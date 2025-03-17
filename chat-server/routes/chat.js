const express = require("express");
const data = require("../data/data.json");
const logger = require("../utils/logger");
const path = require("path");

function createChatRouter(io) {
  const router = express.Router();

  router.get("/chat-list/:userId", (req, res) => {
    logger.info("Fetching chat list");
    const { userId } = req.params;
    logger.info(`Fetching chat list for user: ${userId}`);

    const chatList = data.chatLists[userId] || [];
    res.json(chatList);
  });

  router.post("/send-message", (req, res) => {
    const { from, to, content, type } = req.body;

    if (!from || !to || !content || !type) {
      logger.error("Missing required fields in send-message request");
      return res.status(400).json({ error: "Missing required fields" });
    }

    const message = {
      from,
      to,
      content,
      type,
      timestamp: new Date().toISOString(),
      read: false,
    };

    // Update sender's chat list
    if (!data.chatLists[from]) {
      data.chatLists[from] = [];
    }
    let senderChat = data.chatLists[from].find((chat) => chat.with === to);
    if (!senderChat) {
      senderChat = { with: to, unreadCount: 0, messages: [] };
      data.chatLists[from].push(senderChat);
    }
    senderChat.messages.push({ ...message, read: true }); // Mark sender's own message as read

    // Update receiver's chat list
    if (!data.chatLists[to]) {
      data.chatLists[to] = [];
    }
    let receiverChat = data.chatLists[to].find((chat) => chat.with === from);
    if (!receiverChat) {
      receiverChat = { with: from, unreadCount: 0, messages: [] };
      data.chatLists[to].push(receiverChat);
    }
    receiverChat.messages.push(message);
    receiverChat.unreadCount = (receiverChat.unreadCount || 0) + 1;

    logger.info(`New message sent from ${from} to ${to}`);

    io.to(to).emit("new-message", message);

    res
      .status(200)
      .json({ success: true, message: "Message sent successfully" });
  });

  router.post("/allread", (req, res) => {
    const { userId, chatId } = req.body;
    if (!userId || !chatId) {
      logger.error("Missing required fields in allread request");
      return res.status(400).json({ error: "Missing required fields" });
    }

    const userChatList = data.chatLists[userId] || [];
    let found = false;

    const updatedChatList = userChatList.map((chat) => {
      if (chat.with === chatId) {
        found = true;
        logger.info(
          `Resetting unreadCount for user ${userId} chat with ${chatId}`
        );
        return { ...chat, unreadCount: 0 };
      }
      return chat;
    });

    if (found) {
      data.chatLists[userId] = updatedChatList;
      io.to(chatId).emit("messages-read", { userId, chatId });
    } else {
      logger.error(`Chat with ${chatId} not found for user ${userId}`);
    }

    return res.status(200).json({
      success: true,
      message: "All messages marked as read (if applicable)",
    });
  });

  router.post("/k-notify", (req, res) => {
    const {
      to,
      from,
      templateId,
      title,
      content,
      link_title,
      link_uri,
      sdata,
    } = req.body;

    if (!to || !from || !content || !templateId) {
      logger.error("Missing required fields in k-notify request");
      return res.status(400).json({ error: "Missing required fields" });
    }

    const message = {
      from,
      to,
      title,
      content,
      link_title,
      link_uri,
      type: "notification",
      // type: "text",
      timestamp: new Date().toISOString(),
      read: false,
    };

    // Update sender's chat list
    if (!data.chatLists[from]) {
      data.chatLists[from] = [];
    }
    let senderChat = data.chatLists[from].find((chat) => chat.with === to);
    if (!senderChat) {
      senderChat = { with: to, unreadCount: 0, messages: [] };
      data.chatLists[from].push(senderChat);
    }
    senderChat.messages.push({ ...message, read: true }); // Sender sees it as read

    // Update receiver's chat list
    if (!data.chatLists[to]) {
      data.chatLists[to] = [];
    }
    let receiverChat = data.chatLists[to].find((chat) => chat.with === from);
    if (!receiverChat) {
      receiverChat = { with: from, unreadCount: 0, messages: [] };
      data.chatLists[to].push(receiverChat);
    }
    receiverChat.messages.push(message);
    receiverChat.unreadCount = (receiverChat.unreadCount || 0) + 1;

    logger.info(`Sending k-notify notification to ${to} from ${from}`);

    io.to(to).emit("new-message", message);

    res
      .status(200)
      .json({ success: true, message: "Notification sent successfully" });
  });

  router.post("/fd-notify", (req, res) => {
    const {
      to,
      type,
      filename,
      title,
      path: filePath = "/pdf/",
      desc = "",
    } = req.body;

    if (!to || !type || !filename) {
      logger.error("Missing required fields in fd-notify request");
      return res.status(400).json({ error: "Missing required fields" });
    }

    const fileTitle = title || path.parse(filename).name;
    const message = {
      from: "admin",
      to,
      content: "파일이 도착했습니다.",
      type,
      filename,
      title: fileTitle,
      path: filePath,
      desc,
      timestamp: new Date().toISOString(),
      read: false,
    };

    // Update sender's chat list (admin)
    if (!data.chatLists["admin"]) {
      data.chatLists["admin"] = [];
    }
    let senderChat = data.chatLists["admin"].find((chat) => chat.with === to);
    if (!senderChat) {
      senderChat = { with: to, unreadCount: 0, messages: [] };
      data.chatLists["admin"].push(senderChat);
    }
    senderChat.messages.push({ ...message, read: true });

    // Update receiver's chat list
    if (!data.chatLists[to]) {
      data.chatLists[to] = [];
    }
    let receiverChat = data.chatLists[to].find((chat) => chat.with === "admin");
    if (!receiverChat) {
      receiverChat = { with: "admin", unreadCount: 0, messages: [] };
      data.chatLists[to].push(receiverChat);
    }
    receiverChat.messages.push(message);
    receiverChat.unreadCount = (receiverChat.unreadCount || 0) + 1;

    logger.info(`Sending file notification to ${to}: ${filename}`);

    io.to(to).emit("new-message", message);

    res
      .status(200)
      .json({ success: true, message: "File notification sent successfully" });
  });

  return router;
}

module.exports = createChatRouter;
