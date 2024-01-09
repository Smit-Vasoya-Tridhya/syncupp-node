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
const getAdminProfile = {
  tags: ["Admin Panel"],
  description: "",
  summary: "Get Admin Profile ",
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
  "/api/v1/admin/getProfile": {
    get: getAdminProfile,
  },
  "/api/v1/admin/updateProfile": {
    put: updateAdminProfile,
  },
};

module.exports = adminRoutes;
