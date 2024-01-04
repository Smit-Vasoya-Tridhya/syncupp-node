const loginTeamMember = {
  tags: ["Team Member"],
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
  tags: ["Team Member"],
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
  tags: ["Team Member"],
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
  tags: ["Team Member"],
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
  tags: ["Team Member"],
  description:
    "sortOrder = (asc ,desc)  ,sortField = (name ,email , comtact_no  , page  = (number) , resultPerPage   =(number)  , )  , ",
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
            sortOrder: {
              type: "asc",
              description: "Enter email id",
              required: true,
            },
            sortField: {
              type: "string",
              description: "Enter sortField",
              required: true,
            },
            resultPerPage: {
              type: "integer",
              description: "Enter resultPerPage",
              required: true,
            },
            page: {
              type: "integer",
              description: "Enter page Number",
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
  tags: ["Team Member"],
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
  tags: ["Team Member"],
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
  "/api/v1/teamMember/login": {
    post: loginTeamMember,
  },

  "/api/v1/teamMember/add": {
    post: addTeamMember,
  },
  "/api/v1/teamMember/verify": {
    post: verifyTeamMember,
  },
  "/api/v1/teamMember/getAll": {
    get: getAllTeamMember,
  },
  "/api/v1/teamMember/details/{id}": {
    get: getTeamMember,
  },
  "/api/v1/teamMember/delete/{id}": {
    delete: deleteTeamMember,
  },
  "/api/v1/teamMember/edit/{id}": {
    put: editTeamMember,
  },
};

module.exports = teamMembersRoutes;
