const createActivity = {
  tags: ["Activity - CRM Panel"],
  description: "",
  summary: "Create Activity for the call or other type",
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
              required: true,
            },
            agenda: {
              type: "string",
              required: true,
            },
            client_id: {
              type: "string",
              required: true,
            },
            due_date: {
              type: "string",
              required: true,
            },
            assign_to: {
              type: "string",
              required: true,
            },
            activity_type: {
              type: "string",
              required: true,
            },
            meeting_start_time: {
              type: "string",
              required: true,
            },
            meeting_end_time: {
              type: "string",
              required: true,
            },
            internal_info: {
              type: "string",
            },
            recurring_end_date: {
              type: "string",
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

const updateActivity = {
  tags: ["Activity - CRM Panel"],
  description: "",
  summary: "update Activity for the call or other type",
  security: [
    {
      bearerAuth: [],
    },
  ],
  parameters: [
    {
      name: "activityId",
      in: "path",
      required: true,
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
              required: true,
            },
            agenda: {
              type: "string",
              required: true,
            },
            client_id: {
              type: "string",
              required: true,
            },
            due_date: {
              type: "string",
              required: true,
            },
            assign_to: {
              type: "string",
              required: true,
            },
            activity_type: {
              type: "string",
              required: true,
            },
            meeting_start_time: {
              type: "string",
              required: true,
            },
            meeting_end_time: {
              type: "string",
              required: true,
            },
            internal_info: {
              type: "string",
            },
            recurring_end_date: {
              type: "string",
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

const getActivity = {
  tags: ["Activity - CRM Panel"],
  description: "",
  summary: "get Activity for the call or other type",
  security: [
    {
      bearerAuth: [],
    },
  ],
  parameters: [
    {
      name: "activityId",
      in: "path",
      required: true,
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

const activityRoute = {
  "/api/v1/activity/call-meeting": {
    post: createActivity,
  },
  "/api/v1/activity/update/call-meeting/{activityId}": {
    patch: updateActivity,
  },
  "/api/v1/activity/call-meeting/{activityId}": {
    get: getActivity,
  },
};

module.exports = activityRoute;
