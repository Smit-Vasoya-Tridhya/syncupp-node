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
  requestBody: {
    content: {
      "application/json": {
        schema: {
          type: "object",

          properties: {
            client_id: {
              type: "string",
              description: "Enter client id",
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

const getInvoice = {
  tags: ["Invoice"],
  description: "Get Invoice Data",
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
      description: "ID of the Invoice",
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
    "sortOrder = (asc ,desc)  ,sortField = (invoice_number ,due_date , status  ,total , invoice_date , customer_name)  , page  = (number) , itemsPerPage=(number) . search  = (string))  \n\n For Client Login \n\nagency_id  = (string) is required    ",
  summary: "Get All Invoice  ",
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
              example: "invoice_date",
            },
            sortOrder: {
              type: "string",
              description: "Enter sortOrder",
              example: "desc",
            },
            page: {
              type: "number",
              description: "Enter page number",
              example: 1,
            },
            itemsPerPage: {
              type: "number",
              description: "Enter itemsPerPage",
              example: 10,
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
  description: "status : [`draft` , `unpaid`]",
  summary: "Update Invoice ",
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
            invoice_date: {
              type: "string",
              description: "Enter Invoice Date",
              format: "date",
            },
            invoice_content: {
              type: "array",
              description: "Enter invoice_content",
              items: {
                type: "object",
                properties: {
                  item: {
                    type: "string",
                    description: "Item name",
                  },
                  qty: {
                    type: "integer",
                    description: "Quantity",
                  },
                  rate: {
                    type: "integer",
                    description: "Rate per item",
                  },
                  tax: {
                    type: "integer",
                    description: "Tax percentage",
                  },
                  amount: {
                    type: "integer",
                    description: "Total amount for the item",
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  parameters: [
    {
      name: "id",
      in: "path", // or "query" depending on your use case
      description: "ID of the invoice",
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

const updateInvoiceStatus = {
  tags: ["Invoice"],
  description: "status : [ `unpaid` , `paid`,`overdue`]",
  summary: "Update Invoice Status ",

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
            status: {
              type: "string",
              description: "Enter status",
            },
          },
        },
      },
    },
  },
  parameters: [
    {
      name: "id",
      in: "path", // or "query" depending on your use case
      description: "ID of the invoice",
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
const createInvoice = {
  tags: ["Invoice"],
  description: "status : [`draft` , `unpaid`]",
  summary: "Create invoice",

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
            due_date: {
              type: "string",
              description: "Enter due_date",
              format: "date",
            },
            invoice_date: {
              type: "string",
              description: "Enter Invoice Date",
              format: "date",
            },
            invoice_content: {
              type: "array",
              description: "Enter invoice_content",
              items: {
                type: "object",
                properties: {
                  item: {
                    type: "string",
                    description: "Item name",
                  },
                  qty: {
                    type: "integer",
                    description: "Quantity",
                  },
                  rate: {
                    type: "integer",
                    description: "Rate per item",
                  },
                  tax: {
                    type: "integer",
                    description: "Tax percentage",
                  },
                  amount: {
                    type: "integer",
                    description: "Total amount for the item",
                  },
                },
              },
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

const sendInvoice = {
  tags: ["Invoice"],
  description: "",
  summary: "Send Invoice",
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
            invoice_id: {
              type: "string",
              description: "Enter Invoice Id",
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
  "/api/v1/invoice/get-clients": {
    get: getClients,
  },
  "/api/v1/invoice/get-invoice-data": {
    post: getInvoiceInfo,
  },
  "/api/v1/invoice/create-invoice": {
    post: createInvoice,
  },
  "/api/v1/invoice/get-all": {
    post: getAllInvoice,
  },
  "/api/v1/invoice/{id}": {
    get: getInvoice,
    put: updateInvoice,
    delete: deleteInvoice,
  },
  "/api/v1/invoice/status-update/{id}": {
    put: updateInvoiceStatus,
  },
  "/api/v1/invoice/send-invoice": {
    post: sendInvoice,
  },
};

module.exports = invoiceRoutes;
