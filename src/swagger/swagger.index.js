const adminRoutes = require("./swagger_helper/admin.swagger");
const authRoutes = require("./swagger_helper/auth.swagger");
const agencyRoutes = require("./swagger_helper/agency.swagger");
const clientRoutes = require("./swagger_helper/client.swagger");

const swaggerDoc = {
  openapi: "3.0.0",
  host: "",
  info: {
    title: "Admin Panel",
    version: "0.0.1",
    description: "Swagger API Documentation for Admin Panel",
  },

  servers: [
    {
      url: process.env.SWAGGER_URL,
      description: "Development server",
    },
  ],
  security: [
    {
      bearerAuth: [],
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        in: "header",
        name: "Authorization",
        description: "Bearer token to access these api endpoints",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  tags: [
    {
      name: "Admin Panel",
      description: "Admin's Route",
    },
    {
      name: "CRM Panel",
      description: "CRM panel Authentication route",
    },
  ],

  paths: {
    ...adminRoutes,
    ...authRoutes,
    ...agencyRoutes,
    ...clientRoutes,
  },
};
module.exports = swaggerDoc;
