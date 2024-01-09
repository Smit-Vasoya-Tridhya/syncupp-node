const registerAgency = {
  tags: ["CRM Panel"],
  description: "",
  summary: "Register Agency.",
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
  requestBody: {
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            access_token: {
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

const countriesList = {
  tags: ["CRM Panel"],
  description: "",
  summary: "Get all Countries",
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
              default: 10,
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

const statesList = {
  tags: ["CRM Panel"],
  description: "",
  summary: "Get all states",
  parameters: [
    {
      name: "countryId",
      in: "path",
      description: "provide the country id",
      required: true,
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
              default: 10,
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

const citiesList = {
  tags: ["CRM Panel"],
  description: "",
  summary: "Get all cities",
  parameters: [
    {
      name: "stateId",
      in: "path",
      description: "provide the state id",
      required: true,
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
              default: 10,
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
    post: facebookSignIn,
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
  "/api/v1/auth/countries": {
    post: countriesList,
  },
  "/api/v1/auth/states/{countryId}": {
    post: statesList,
  },
  "/api/v1/auth/cities/{stateId}": {
    post: citiesList,
  },
};

module.exports = authRoutes;
