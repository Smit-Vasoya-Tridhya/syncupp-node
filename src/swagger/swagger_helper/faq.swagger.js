const addFaqAdmin = {
  tags: ["Admin Panel"],
  description: "",
  summary: "Add FAQ ",
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
            question: {
              type: "string",
              description: "Enter question",
            },
            answer: {
              type: "string",
              description: "Enter answer",
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

const getAllFaq = {
  tags: ["Admin Panel"],
  description:
    "sortOrder = (asc ,desc)  ,sortField = (name ,email , contact_no)  , page  = (number) , itemsPerPage=(number))",
  summary: "Get All FAQ ",
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
              required: true,
            },
            sortOrder: {
              type: "string",
              description: "Enter sortOrder",
              required: true,
            },
            page: {
              type: "number",
              description: "Enter page number",
              required: true,
            },
            itemsPerPage: {
              type: "number",
              description: "Enter itemsPerPage",
              required: true,
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

const deleteFaq = {
  tags: ["Admin Panel"],
  description:
    'Pass data like this {"faqIdsToDelete" : ["6597aeb9528e7bc34319c6f7" , "6597b11b248ca49192fcb7b9"]}',
  summary: "Delete FAQ ",
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
            faqIdsToDelete: {
              type: "array",
              description: "Enter FQA IDS to be deleted",
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

const updateFaqAdmin = {
  tags: ["Admin Panel"],
  description: "",
  summary: "Update FAQ ",
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
            question: {
              type: "string",
              description: "Enter question",
            },
            answer: {
              type: "string",
              description: "Enter answer",
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

const getFaqAdmin = {
  tags: ["Admin Panel"],
  description: "",
  summary: "Get FAQ ",
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

const faqRoutes = {
  "/api/v1/admin/add-faq": {
    post: addFaqAdmin,
  },
  "/api/v1/admin/get-all-faq": {
    get: getAllFaq,
  },
  "/api/v1/admin/delete-faq": {
    delete: deleteFaq,
  },
  "/api/v1/admin/get-faq/{id}": {
    get: getFaqAdmin,
  },
  "/api/v1/admin/update-faq/{id}": {
    put: updateFaqAdmin,
  },
};

module.exports = faqRoutes;