const adminRoutes = require("./swagger_helper/admin.swagger");
const authRoutes = require("./swagger_helper/auth.swagger");

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
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
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
  },
};
module.exports = swaggerDoc;
