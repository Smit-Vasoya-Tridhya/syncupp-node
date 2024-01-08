const getAgencyProfile = {
  tags: ["Agency"],
  description: "",
  summary: "Get agency profile ",
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

const updateAgencyProfile = {
  tags: ["Agency"],
  description: "",
  summary: "Update agency profile ",
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
              required: true,
            },
            last_name: {
              type: "string",
              description: "Enter last name",
              required: true,
            },
            contact_number: {
              type: "number",
              description: "Enter contact number",
              required: true,
            },
            address: {
              type: "string",
              description: "Enter address",
              required: true,
            },
            city: {
              type: "string",
              description: "Enter city",
              required: true,
            },
            company_name: {
              type: "string",
              description: "Enter company name ",
              required: true,
            },
            company_website: {
              type: "string",
              description: "Enter Company Website",
              required: true,
            },
            country: {
              type: "string",
              description: "Enter country",
              required: true,
            },
            industry: {
              type: "string",
              description: "Enter industry",
              required: true,
            },
            no_of_people: {
              type: "string",
              description: "Enter No of people",
              required: true,
            },
            pin_code: {
              type: "number",
              description: "Enter Pin code",
              required: true,
            },
            state: {
              type: "string",
              description: "Enter state name",
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

const agenciesRoutes = {
  "/api/v1/agency/get-profile": {
    get: getAgencyProfile,
  },
  "/api/v1/agency/update-profile": {
    put: updateAgencyProfile,
  },
};

module.exports = agenciesRoutes;
