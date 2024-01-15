const getClients = {
  tags: ["Invoice"],
  description: "",
  summary: "Get Clients ",
  security: [
    {
      bearerAuth: [],
    },
  ],
  requestBody: {},
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

const getInvoiceInfo = {
  tags: ["Invoice"],
  description: "",
  summary: "get invoice information ",
  security: [
    {
      bearerAuth: [],
    },
  ],
  requestBody: {},
  parameters: [
    {
      name: "id",
      in: "path", // or "query" depending on your use case
      description: "ID of the team member",
      required: true,
      schema: {
        type: "string", // adjust the type accordingly
      },
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

const getInvoice = {
  tags: ["Invoice"],
  description: "",
  summary: "get invoice  ",
  security: [
    {
      bearerAuth: [],
    },
  ],
  requestBody: {},
  parameters: [
    {
      name: "id",
      in: "path", // or "query" depending on your use case
      description: "ID of the team member",
      required: true,
      schema: {
        type: "string", // adjust the type accordingly
      },
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

const deleteInvoice = {
  tags: ["Invoice"],
  description: "",
  summary: "Delete invoice  ",
  security: [
    {
      bearerAuth: [],
    },
  ],
  requestBody: {},
  parameters: [
    {
      name: "id",
      in: "path", // or "query" depending on your use case
      description: "ID of the team member",
      required: true,
      schema: {
        type: "string", // adjust the type accordingly
      },
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

const getAllInvoice = {
  tags: ["Invoice"],
  description:
    "sortOrder = (asc ,desc)  ,sortField = (invoice_number ,due_date , status  ,total , createdAt)  , page  = (number) , itemsPerPage=(number))",
  summary: "Get All Agreement agency wise ",
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
            sortField: {
              type: "string",
              description: "Enter sortField",
            },
            sortOrder: {
              type: "string",
              description: "Enter sortOrder",
            },
            page: {
              type: "number",
              description: "Enter page number",
            },
            itemsPerPage: {
              type: "number",
              description: "Enter itemsPerPage",
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

const updateInvoice = {
  tags: ["Invoice"],
  description: "Update Invoice",
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
            recipient: {
              type: "string",
              description: "Enter recipient",
            },
            status: {
              type: "string",
              description: "Enter status",
            },
            due_date: {
              type: "string",
              description: "Enter due_date",
              format: "date",
            },
            invoice_content: {
              type: "array",
              description: "Enter invoice_content",
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

const createInvoice = {
  tags: ["Invoice"],
  description: "Create invoice",
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
            invoice_number: {
              type: "string",
              description: "Enter invoice_number",
            },
            recipient: {
              type: "string",
              description: "Enter recipient",
            },
            status: {
              type: "string",
              description: "Enter status",
            },
            client_id: {
              type: "string",
              description: "Enter client_id",
            },
            due_date: {
              type: "string",
              description: "Enter due_date",
              format: "date",
            },
            invoice_content: {
              type: "array",
              description: "Enter invoice_content",
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

const invoiceRoutes = {
  "/api/v1/agency/invoice/get-clients": {
    get: getClients,
  },
  "/api/v1/agency/invoice/get-invoice-data/{id}": {
    get: getInvoiceInfo,
  },
  "/api/v1/agency/invoice/create-invoice": {
    post: createInvoice,
  },
  "/api/v1/agency/invoice/get-all": {
    post: getAllInvoice,
  },
  "/api/v1/client/invoice/get-all": {
    post: getAllInvoice,
  },
  "/api/v1/agency/invoice/{id}": {
    get: getInvoice,
  },
  "/api/v1/client/invoice/{id}": {
    get: getInvoice,
  },
  "/api/v1/agency/invoice/{id}": {
    delete: deleteInvoice,
  },
  "/api/v1/agency/invoice/{id}": {
    put: updateInvoice,
  },
};

module.exports = invoiceRoutes;
