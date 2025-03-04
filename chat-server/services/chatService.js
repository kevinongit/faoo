const data = require('../data/data.json');
const logger = require('../utils/logger');

function sendMessage(from, to, content, type) {
  logger.info(`Sending message from ${from} to ${to}`);

  const message = {
    from,
    to,
    content,
    type,
    timestamp: new Date().toISOString(),
    read: false
  };

  // Update sender's chat list
  if (!data.chatLists[from]) {
    data.chatLists[from] = [];
  }
  let senderChat = data.chatLists[from].find(chat => chat.with === to);
  if (!senderChat) {
    senderChat = { with: to, messages: [] };
    data.chatLists[from].push(senderChat);
  }
  senderChat.messages.push(message);

  // Update receiver's chat list
  if (!data.chatLists[to]) {
    data.chatLists[to] = [];
  }
  let receiverChat = data.chatLists[to].find(chat => chat.with === from);
  if (!receiverChat) {
    receiverChat = { with: from, messages: [] };
    data.chatLists[to].push(receiverChat);
  }
  receiverChat.messages.push(message);

  logger.info(`Message sent successfully from ${from} to ${to}`);
  return message;
}

module.exports = { sendMessage };
