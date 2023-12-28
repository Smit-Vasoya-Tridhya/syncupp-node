const jwt = require("jsonwebtoken");
const logger = require("../logger");
const { returnMessage } = require("../utils/utils");

class AuthService {
  tokenGenerator = (payload) => {
    try {
      const token = jwt.sign({ id: payload._id }, process.env.JWT_SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRES_IN,
      });
      return { token, user: payload };
    } catch (error) {
      logger.error("Error while token generate", error);
      return error.message;
    }
  };
}

module.exports = AuthService;
