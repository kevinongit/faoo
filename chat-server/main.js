const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const morgan = require('morgan');
const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');
const chatService = require('./services/chatService');
const logger = require('./utils/logger');

const app = express();
const server = http.createServer(app);


app.use(cors());
app.use(express.json());
app.use(morgan('combined'));

const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use('/api', authRoutes);
app.use('/api', chatRoutes);

io.on('connection', (socket) => {
  logger.info('A user connected');

  socket.on('join', (userId) => {
    socket.join(userId);
    logger.info(`User ${userId} joined their room`);
  });

  socket.on('send-message', ({ from, to, content, type }) => {
    const message = chatService.sendMessage(from, to, content, type);
    io.to(to).emit('new-message', message);
    logger.info(`Message sent from ${from} to ${to}`);
  });

  socket.on('disconnect', () => {
    logger.info('A user disconnected');
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
