const adminRoutes = require("./swagger_helper/admin.swagger");

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
  ],

  paths: {
    ...adminRoutes,
  },
};
module.exports = swaggerDoc;
