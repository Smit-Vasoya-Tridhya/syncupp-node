const addAgreementAdmin = {
  tags: ["Agreement"],
  description: "",
  summary: "Add Agreement ",
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
          required: ["client_id", "due_date", "status"], // Specify required fields
          properties: {
            client_id: {
              type: "string",
              description: "The due date of the agreement.",
              required: true,
            },
            due_date: {
              type: "string",
              description: "The due date of the agreement.",
              required: true,
            },
            status: {
              type: "string",
              description: "The status of the agreement.",
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

const getAllAgreement = {
  tags: ["Agreement"],
  description:
    "sortOrder = (asc ,desc)  ,sortField = (name ,email , contact_no)  , page  = (number) , itemsPerPage=(number))",
  summary: "Get All Agreement ",
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

const deleteAgreement = {
  tags: ["Agreement"],
  description: " ",
  summary: "delete Agreement  ",

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

const updateAgreement = {
  tags: ["Agreement"],
  description: "status : [`draft` , `sent`]",
  summary: "Update Agreement ",
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
            title: {
              type: "string",
              description: "Enter title",
            },
            description: {
              type: "string",
              description: "Enter description",
            },
            due_date: {
              type: "string",
              format: "date",
              description: "Enter description",
            },
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

const getAgreement = {
  tags: ["Agreement"],
  description: "",
  summary: "Get Agreement ",
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

const updateAgreementStatus = {
  tags: ["Agreement"],
  description: "status : [`draft` , `sent`]",
  summary: "Update Agreement status ",
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

const getAllClientAgreement = {
  tags: ["Agreement"],
  description:
    "sortOrder = (asc ,desc)  ,sortField = (name ,email , contact_no)  , page  = (number) , itemsPerPage=(number))",
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
const agreementRoutes = {
  "/api/v1/agency/add-agreement": {
    post: addAgreementAdmin,
  },
  "/api/v1/agency/get-all-agreement": {
    post: getAllAgreement,
  },
  "/api/v1/agency/delete-agreement": {
    delete: deleteAgreement,
  },
  "/api/v1/agency/get-agreement/{id}": {
    get: getAgreement,
  },
  "/api/v1/agency/update-agreement/{id}": {
    put: updateAgreement,
  },
  "/api/v1/client/get-agreement/{id}": {
    get: getAgreement,
  },
  "/api/v1/client/update-agreement/{id}": {
    put: updateAgreementStatus,
  },
  "/api/v1/client/update-agreement/{id}": {
    put: updateAgreementStatus,
  },
  "/api/v1/client/get-all-agreement": {
    post: getAllClientAgreement,
  },
};

module.exports = agreementRoutes;
