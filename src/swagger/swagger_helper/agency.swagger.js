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
