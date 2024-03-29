const registerAgency = {
  tags: ["CRM Panel"],
  description: "",
  summary: "Register Agency.",
  security: [],
  requestBody: {
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            first_name: {
              type: "string",
              descripition: "Enter your first name",
              required: true,
            },
            last_name: {
              type: "string",
              descripition: "Enter your last name",
              required: true,
            },
            email: {
              type: "string",
              descripition: "Enter your email",
              required: true,
            },
            contact_number: {
              type: "string",
              descripition: "Enter your contact number",
              required: true,
            },
            password: {
              type: "string",
              descripition: "Enter your password",
              required: true,
            },
            remember_me: {
              type: "boolean",
              default: false,
            },
            company_website: {
              type: "string",
              descripition: "Enter your company website",
            },
            no_of_people: {
              type: "string",
              descripition: "Enter no. of people",
            },
            company_name: {
              type: "string",
              descripition: "Enter name of company",
            },
            industry: {
              type: "string",
              descripition: "Enter object id of the industry",
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

const googleSignIn = {
  tags: ["CRM Panel"],
  description: "Agency Google SignIn",
  summary: "Agency Google SignIn",
  requestBody: {
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            signupId: {
              type: "string",
              descripition: "Enter your token",
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

const facebookSignIn = {
  tags: ["CRM Panel"],
  description: "Agency Facebook SignIn",
  summary: "Agency Facebook SignIn",
  parameters: [
    {
      name: "code",
      in: "query",
      description: "Code from the facebook signup",
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

const login = {
  tags: ["CRM Panel"],
  description: "CRM login",
  summary: "CRM login",
  requestBody: {
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            email: {
              type: "string",
              descripition: "Enter your email",
              required: true,
            },
            password: {
              type: "string",
              descripition: "Enter your password",
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

const forgotPassword = {
  tags: ["CRM Panel"],
  description: "CRM forgot password",
  summary: "CRM forgot password",
  requestBody: {
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            email: {
              type: "string",
              descripition: "Enter your email",
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

const resetPassword = {
  tags: ["CRM Panel"],
  description: "CRM reset password",
  summary: "CRM reset password",
  requestBody: {
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            email: {
              type: "string",
              descripition: "Enter your email",
              required: true,
            },
            password: {
              type: "string",
              descripition: "Enter your password",
              required: true,
            },
            token: {
              type: "string",
              descripition: "Enter your token",
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

const changePassword = {
  tags: ["CRM Panel"],
  description: "CRM change password",
  summary: "CRM change password",
  requestBody: {
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            old_password: {
              type: "string",
              descripition: "Enter your old password",
              required: true,
            },
            new_password: {
              type: "string",
              descripition: "Enter your new password",
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

const authRoutes = {
  "/api/v1/auth/signup": {
    post: registerAgency,
  },
  "/api/v1/auth/google-signup": {
    post: googleSignIn,
  },
  "/api/v1/auth/facebook-signup": {
    get: facebookSignIn,
  },
  "/api/v1/auth/login": {
    post: login,
  },
  "/api/v1/auth/forgot-password": {
    post: forgotPassword,
  },
  "/api/v1/auth/reset-password": {
    post: resetPassword,
  },
  "/api/v1/auth/change-password": {
    post: changePassword,
  },
};

module.exports = authRoutes;
