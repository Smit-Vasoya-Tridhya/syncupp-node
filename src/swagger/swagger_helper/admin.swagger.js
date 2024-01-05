const loginAdmin = {
  tags: ["Admin Panel"],
  description: "",
  summary: "Login Admin ",
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
            email: {
              type: "string",
              description: "Enter email id",
              required: true,
            },
            password: {
              type: "string",
              description: "Enter password",
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
const forgotAdminPassword = {
  tags: ["Admin Panel"],
  description: "",
  summary: "Admin Forgot Password ",
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
            email: {
              type: "string",
              description: "Enter email id",
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
const resetAdminPassword = {
  tags: ["Admin Panel"],
  description: "",
  summary: "Reset Admin Password ",
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
            email: {
              type: "string",
              description: "Enter email id",
              required: true,
            },
            newPassword: {
              type: "string",
              description: "Enter password",
              required: true,
            },
            token: {
              type: "string",
              description: "Enter token",
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

const updateAdminPassword = {
  tags: ["Admin Panel"],
  description: "",
  summary: "Update Admin Password ",
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
            oldPassword: {
              type: "string",
              description: "Enter email id",
              required: true,
            },
            newPassword: {
              type: "string",
              description: "Enter password",
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

const updateAdminProfile = {
  tags: ["Admin Panel"],
  description: "",
  summary: "Update Admin Profile ",
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
            first_name: {
              type: "string",
              description: "Enter first name",
            },
            last_name: {
              type: "string",
              description: "Enter last name",
            },
            contact_no: {
              type: "number",
              description: "Enter contact number",
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
  description: "",
  summary: "Get All FAQ ",
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

const adminRoutes = {
  "/api/v1/admin/login": {
    post: loginAdmin,
  },
  "/api/v1/admin/forgotPassword": {
    post: forgotAdminPassword,
  },
  "/api/v1/admin/resetPassword": {
    post: resetAdminPassword,
  },
  "/api/v1/admin/updatePassword": {
    put: updateAdminPassword,
  },
  "/api/v1/admin/updateProfile": {
    put: updateAdminProfile,
  },
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

module.exports = adminRoutes;
