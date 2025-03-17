const express = require("express");
const http = require("http");
require("dotenv").config();
const socketIo = require("socket.io");
const cors = require("cors");
const morgan = require("morgan");
const authRoutes = require("./routes/auth");
const jwt = require("jsonwebtoken");
const chatService = require("./services/chatService");
const logger = require("./utils/logger");

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());
app.use(morgan("combined"));

const io = socketIo(server, {
  cors: {
    origin: "*",
    // origin: "http://localhost:4200",
    // methods: ["GET", "POST"],
    // credentials: true,
  },
});

const createChatRouter = require("./routes/chat");
const chatRouter = createChatRouter(io);
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};
app.use("/api/chat", authMiddleware, chatRouter);

app.use("/api", authRoutes);
app.use("/api", chatRouter);

io.use((socket, next) => {
  const token = socket.handshake.query.token;

  console.log("Token:", token);
  console.log("JWT_SECRET:", process.env.JWT_SECRET);
  if (!token) {
    logger.error("Authentication error: Token not provided");
    return next(new Error("Authentication error: Token not provided"));
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      logger.error("Authentication error: Invalid token");
      return next(new Error("Authentication error: Invalid token"));
    }
    socket.userId = decoded.userId;
    next();
  });
});

io.on("connection", (socket) => {
  logger.info(`User ${socket.userId} connected`);

  socket.on("join", (userId) => {
    socket.userId = userId;
    socket.join(userId);
    logger.info(`User ${userId} joined their room`);
  });

  socket.on("send-message", ({ from, to, content, type }) => {
    const message = chatService.sendMessage(from, to, content, type);
    io.to(to).emit("new-message", message);
    logger.info(`Message sent from ${from} to ${to}`);
  });

  socket.on("disconnect", () => {
    logger.info(`A user(${socket.userId}) disconnected`);
  });
});

const PORT = process.env.PORT || 5200;
server.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
