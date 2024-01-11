const loginTeamMember = {
  tags: ["Team Member - CRM Panel"],
  description: "",
  summary: "Login team Member ",
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

const verifyTeamMember = {
  tags: ["Team Member - CRM Panel"],
  description: "",
  summary: "Team Member Verify Password ",
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
            first_name: {
              type: "string",
              description: "Enter first_name",
              required: true,
            },
            last_name: {
              type: "string",
              description: "Enter last_name",
              required: true,
            },
            token: {
              type: "string",
              description: "Enter token",
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

const addTeamMember = {
  tags: ["Team Member - CRM Panel"],
  description: "",
  summary: "Team Member Forgot Password ",
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
            name: {
              type: "string",
              description: "Enter name",
              required: true,
            },
            contact_number: {
              type: "number",
              description: "Enter contact number",
              required: true,
            },
            role: {
              type: "string",
              description: "Enter role",
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

const getTeamMember = {
  tags: ["Team Member - CRM Panel"],
  description: "",
  summary: "Get team member ",
  security: [
    {
      bearerAuth: [],
    },
  ],
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

const getAllTeamMember = {
  tags: ["Team Member - CRM Panel"],
  description:
    "sortOrder = (asc ,desc)  ,sortField = (name ,email , contact_no)  , page  = (number) , itemsPerPage=(number))",
  summary: "Get All Team Member Member ",
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
const deleteTeamMember = {
  tags: ["Team Member - CRM Panel"],
  description: "",
  summary: "Delete Team Member ",
  security: [
    {
      bearerAuth: [],
    },
  ],
  parameters: [
    {
      name: "id",
      in: "path", // or "query" depending on your use case
      description: "ID of the team member",
      required: true,
      schema: {
        type: "integer", // adjust the type accordingly
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

const editTeamMember = {
  tags: ["Team Member - CRM Panel"],
  description: "",
  summary: "Edit Team Member ",
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
            name: {
              type: "string",
              description: "Enter name",
              required: true,
            },
            contact_number: {
              type: "number",
              description: "Enter contact number",
              required: true,
            },

            first_name: {
              type: "string",
              description: "Enter first name",
              required: true,
            },
            last_name: {
              type: "string",
              description: "Enter last name",
              required: true,
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

const teamMembersRoutes = {
  "/api/v1/team-member/login": {
    post: loginTeamMember,
  },
  "/api/v1/team-member/verify": {
    post: verifyTeamMember,
  },

  "/api/v1/agency/team-member/add": {
    post: addTeamMember,
  },

  "/api/v1/agency/team-member": {
    get: getAllTeamMember,
  },
  "/api/v1/agency/team-member/details/{id}": {
    get: getTeamMember,
  },
  "/api/v1/agency/team-member/delete/{id}": {
    delete: deleteTeamMember,
  },
  "/api/v1/agency/team-member/edit/{id}": {
    put: editTeamMember,
  },

  "/api/v1/client/team-member/add": {
    post: addTeamMember,
  },
  "/api/v1/client/team-member": {
    get: getAllTeamMember,
  },
  "/api/v1/client/team-member/details/{id}": {
    get: getTeamMember,
  },
  "/api/v1/client/team-member/delete/{id}": {
    delete: deleteTeamMember,
  },
  "/api/v1/client/team-member/edit/{id}": {
    put: editTeamMember,
  },
};

module.exports = teamMembersRoutes;
