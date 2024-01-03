const loginTeamAgency = {
  tags: ["Team Agency"],
  description: "",
  summary: "Login team agency ",
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

const verifyTeamAgency = {
  tags: ["Team Agency"],
  description: "",
  summary: "Team agency Forgot Password ",
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

const addTeamMemberAgency = {
  tags: ["Team Agency"],
  description: "",
  summary: "Team Agency Forgot Password ",
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

const getTeamMemberAgency = {
  tags: ["Team Agency"],
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

const getAllTeamMemberAgency = {
  tags: ["Team Agency"],
  description:
    "sortOrder = (asc ,desc)  ,sortField = (name ,email , comtact_no  , page  = (number) , resultPerPage   =(number)  , )  , ",
  summary: "Get All Team Agency Member ",
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
const deleteTeamMemberAgency = {
  tags: ["Team Agency"],
  description: "",
  summary: "Delete Team Agency ",
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

const editTeamMemberAgency = {
  tags: ["Team Agency"],
  description: "",
  summary: "Edit Team Agency ",
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

const teamAgencyRoutes = {
  "/api/v1/teamAgency/login": {
    post: loginTeamAgency,
  },

  "/api/v1/teamAgency/add": {
    post: addTeamMemberAgency,
  },
  "/api/v1/teamAgency/verify": {
    post: verifyTeamAgency,
  },
  "/api/v1/teamAgency/getAll": {
    get: getAllTeamMemberAgency,
  },
  "/api/v1/teamAgency/details/{id}": {
    get: getTeamMemberAgency,
  },
  "/api/v1/teamAgency/delete/{id}": {
    delete: deleteTeamMemberAgency,
  },
  "/api/v1/teamAgency/edit/{id}": {
    put: editTeamMemberAgency,
  },
};

module.exports = teamAgencyRoutes;
