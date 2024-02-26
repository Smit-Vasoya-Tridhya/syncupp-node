const Chat = require("../models/chatSchema");
const logger = require("../logger");
const { throwError } = require("../helpers/errorUtil");

class ChatService {
  chatHistory = async (user) => {
    try {
      const chat_aggragate = [];
    } catch (error) {
      logger.error(`Erroe while fetching the chat history: ${error}`);
      return throwError(error?.message, error?.statusCode);
    }
  };
}

module.exports = ChatService;
