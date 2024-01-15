const faqRoutes = require("./swagger_helper/faq.swagger");
const adminRoutes = require("./swagger_helper/admin.swagger");
const authRoutes = require("./swagger_helper/auth.swagger");
const agencyRoutes = require("./swagger_helper/agency.swagger");
const clientRoutes = require("./swagger_helper/client.swagger");
const teamMembersRoutes = require("./swagger_helper/teamMember.swagger");
const agenciesRoutes = require("./swagger_helper/agency.swagger");
const agreementRoutes = require("./swagger_helper/agreement.swagger");
const invoiceRoutes = require("./swagger_helper/invoice.swagger");

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
    ...agencyRoutes,
    ...clientRoutes,
    ...faqRoutes,
    ...agenciesRoutes,
    ...agreementRoutes,
    ...invoiceRoutes,
  },
};
module.exports = swaggerDoc;
