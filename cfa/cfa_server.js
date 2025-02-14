/// cfa : the Credit Finanace Association 여신금융협회
const express = require("express");
const bodyParser = require("body-parser");
const connectDB = require("./config/db");
const config = require("./config/config");
const logger = require("./utils/logger");
const errorHandler = require("./middleware/errorHandler");

const authRoutes = require("./routes/auth");
const merchantRoutes = require("./routes/merchant");
const approvalRoutes = require("./routes/approval");
const purchaseRoutes = require("./routes/purchase");
const depositRoutes = require("./routes/deposit");

const app = express();

// Connect to MongoDB
connectDB();

app.use(bodyParser.json());

// Routes
app.use("/oauth", authRoutes);
app.use("/oauth2/mer", merchantRoutes);
app.use("/oauth2/apr", approvalRoutes);
app.use("/oauth2/buy", purchaseRoutes);
app.use("/oauth2/dep", depositRoutes);

// Error handling middleware
app.use(errorHandler);

app.listen(config.port, () => {
  logger.info(`Server is running on http://localhost:${config.port}`);
});
