require("dotenv").config();
const express = require("express");
const cors = require("cors");
// const bodyParser = require("body-parser");
const connectDB = require("./config/db");
const logger = require("./middleware/logger");

const routes = require("./routes/routes");

const app = express();
const port = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api", routes);

// Start server
app.listen(port, () => {
  logger.info(`Server running on port ${port}`);
});
