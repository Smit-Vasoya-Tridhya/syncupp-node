const adminRoutes = require("./swagger_helper/admin.swagger");
const authRoutes = require("./swagger_helper/auth.swagger");
const teamMembersRoutes = require("./swagger_helper/teamMember.swagger");
const agenciesRoutes = require("./swagger_helper/agency.swagger");

const swaggerDoc = {
  openapi: "3.0.0",
  host: "",
  info: {
    title: "SyncUpp",
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
      name: "Team Member",
      description: "Team Member's Route",
      name: "CRM Panel",
      description: "CRM panel Authentication route",
    },
  ],

  paths: {
    ...adminRoutes,
    ...teamMembersRoutes,
    ...authRoutes,
    ...agenciesRoutes,
  },
};
module.exports = swaggerDoc;
