const addClient = {
  tags: ["Agency - CRM Panel"],
  description: "",
  summary: "Create or Register client",
  security: [],
  requestBody: {
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            name: {
              type: "string",
              descripition: "Enter name of client.",
              required: true,
            },
            email: {
              type: "string",
              descripition: "Enter email of client.",
              required: true,
            },
            company_name: {
              type: "string",
              descripition: "Enter company name of client.",
              required: true,
            },
            company_website: {
              type: "string",
              descripition: "Enter company website of client.",
            },
            address: {
              type: "string",
              descripition: "Enter address of client.",
            },
            city: {
              type: "string",
              descripition: "Enter city object Id of client.",
            },
            state: {
              type: "string",
              descripition: "Enter state object Id of client.",
            },
            country: {
              type: "string",
              descripition: "Enter country object id of client.",
            },
            pincode: {
              type: "number",
              descripition: "Enter pincode of client.",
            },
            title: {
              type: "string",
              descripition: "Enter title of client.",
            },
            contact_number: {
              type: "number",
              descripition: "Enter contact number of client.",
            },
          },
        },
      },
    },
  },

  responses: {
    200: {
      descripition: "ok",
      content: {
        "application/json": {
          schema: {
            type: "object",
          },
        },
      },
    },
  },
};

const deleteClient = {
  tags: ["Agency - CRM Panel"],
  description: "",
  summary: "Delete client",
  security: [],
  parameters: [
    {
      name: "clientId",
      in: "path",
      description: "provide the client id",
      required: true,
    },
  ],

  responses: {
    200: {
      descripition: "ok",
      content: {
        "application/json": {
          schema: {
            type: "object",
          },
        },
      },
    },
  },
};

const clientList = {
  tags: ["Agency - CRM Panel"],
  description: "",
  summary: "Get all clients",
  security: [],

  responses: {
    200: {
      descripition: "ok",
      content: {
        "application/json": {
          schema: {
            type: "object",
          },
        },
      },
    },
  },
};

const agencyRoutes = {
  "/api/v1/agency/create-client": {
    post: addClient,
  },
  "/api/v1/agency/delete-client/:clientId": {
    delete: deleteClient,
  },
  "/api/v1/agency/clients": {
    get: clientList,
  },
};

module.exports = agencyRoutes;
