const Chat = require("../models/chatSchema");
const logger = require("../logger");
const { throwError } = require("../helpers/errorUtil");

class ChatService {
  // this function is used to get hte history between 2 users
  chatHistory = async (user) => {
    try {
      const chat_aggragate = [];
    } catch (error) {
      logger.error(`Erroe while fetching the chat history: ${error}`);
      return throwError(error?.message, error?.statusCode);
    }
  };

  // this function is used to fetched the all of the users where we have started the chat
  fetchUsersList = async (user) => {
    try {
      const aggragate = [
        {
          $match: {
            $or: [
              { from_user: user?.reference_id },
              { to_user: user?.reference_id },
            ],
          },
        },
        {
          $lookup: {
            from: "authentications",
            localField: "from_user",
            foreignField: "reference_id",
            as: "from_user",
            pipeline: [
              {
                $project: {
                  _id: 1,
                  name: 1,
                  first_name: 1,
                  last_name: 1,
                  email: 1,
                  assigned_to_name: {
                    $concat: ["$first_name", " ", "$last_name"],
                  },
                  role: 1,
                },
              },
            ],
          },
        },
        {
          $unwind: { path: "$from_user", preserveNullAndEmptyArrays: true },
        },
        {
          $lookup: {
            from: "authentications",
            localField: "to_user",
            foreignField: "reference_id",
            as: "to_user",
            pipeline: [
              {
                $project: {
                  _id: 1,
                  name: 1,
                  first_name: 1,
                  last_name: 1,
                  email: 1,
                  assigned_to_name: {
                    $concat: ["$first_name", " ", "$last_name"],
                  },
                  role: 1,
                },
              },
            ],
          },
        },
        {
          $unwind: { path: "$to_user", preserveNullAndEmptyArrays: true },
        },
      ];

      const users = await Chat.aggregate(aggragate).sort({ createdAt: -1 });

      // below loop is used to get the unique users list where user had chat
    } catch (error) {
      logger.error(`Error while fetching the users list: ${error}`);
      return throwError(error?.message, error?.statusCode);
    }
  };
}

module.exports = ChatService;
