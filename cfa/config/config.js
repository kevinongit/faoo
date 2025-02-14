require("dotenv").config();

module.exports = {
  port: process.env.PORT || 6200,
  mongodbUri: process.env.MONGODB_URI,
  nodeEnv: process.env.NODE_ENV || "development",
  logLevel: process.env.LOG_LEVEL || "info",
};
