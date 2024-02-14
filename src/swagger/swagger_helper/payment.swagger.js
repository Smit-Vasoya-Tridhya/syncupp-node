const paymentHistory = {
  tags: ["Payment - CRM Panel"],
  description: "",
  summary: "Payment History for the Agency",
  security: [
    {
      bearerAuth: [],
    },
  ],
  requestBody: {
    content: {
      "application/json": {
        schema: {
          type: "object",

          properties: {
            page: {
              type: "number",
              description: "Enter page number.",
              default: 1,
            },
            items_per_page: {
              type: "number",
              description: "Enter item per page.",
              default: 5,
            },
            sort_order: {
              type: "string",
              description: "Enter order of sort asc or desc.",
              default: "desc",
            },
            sort_field: {
              type: "string",
              description: "Enter field to sort.",
              default: "createdAt",
            },
            search: {
              type: "string",
              description: "Enter value of search",
            },
          },
        },
      },
    },
  },
  responses: {
    200: {
      description: "ok",
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

const sheets = {
  tags: ["Payment - CRM Panel"],
  description: "",
  summary: "Payment Sheets history for the Agency",
  security: [
    {
      bearerAuth: [],
    },
  ],
  requestBody: {
    content: {
      "application/json": {
        schema: {
          type: "object",

          properties: {
            page: {
              type: "number",
              description: "Enter page number.",
              default: 1,
            },
            items_per_page: {
              type: "number",
              description: "Enter item per page.",
              default: 5,
            },
            sort_order: {
              type: "string",
              description: "Enter order of sort asc or desc.",
              default: "desc",
            },
            sort_field: {
              type: "string",
              description: "Enter field to sort.",
              default: "createdAt",
            },
            search: {
              type: "string",
              description: "Enter value of search",
            },
          },
        },
      },
    },
  },
  responses: {
    200: {
      description: "ok",
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

const removeUser = {
  tags: ["Payment - CRM Panel"],
  description: "",
  summary: "Remove user for the Agency",
  security: [
    {
      bearerAuth: [],
    },
  ],
  parameters: [
    {
      name: "userId",
      in: "path",
      required: true,
    },
  ],
  responses: {
    200: {
      description: "ok",
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

const cancelSubscription = {
  tags: ["Payment - CRM Panel"],
  description: "",
  summary: "Cancel Subscription for the Agency",
  security: [
    {
      bearerAuth: [],
    },
  ],
  responses: {
    200: {
      description: "ok",
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

const getSubscription = {
  tags: ["Payment - CRM Panel"],
  description: "",
  summary: "Get Subscription detail for the Agency",
  security: [
    {
      bearerAuth: [],
    },
  ],
  responses: {
    200: {
      description: "ok",
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

const paymentRoute = {
  "/api/v1/payment/history": {
    post: paymentHistory,
  },
  "/api/v1/payment/sheets": {
    post: sheets,
  },
  "/api/v1/payment/remove-user": {
    post: removeUser,
  },
  "/api/v1/payment/cancel-subscription": {
    get: cancelSubscription,
  },
  "/api/v1/payment/get-subscription": {
    get: getSubscription,
  },
};

module.exports = paymentRoute;
