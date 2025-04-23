// salesapi/swagger.js
const swaggerJSDoc = require("swagger-jsdoc");
const path = require("path");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Sales API",
      version: "1.0.0",
      description: "Sales API 명세서",
    },
    servers: [{ url: "http://localhost:6100", description: "Local server" }],
  },
  // 라우터 파일들 내 @swagger 주석을 읽어들일 경로
  apis: [path.join(__dirname, "../routes/*.js")],
};

module.exports = swaggerJSDoc(options);
