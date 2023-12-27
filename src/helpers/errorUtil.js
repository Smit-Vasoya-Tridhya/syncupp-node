const ErrorHandler = require("./errorHandler");

// this function is used for the throw an error from the service
const throwError = (message, status_code) => {
  throw new ErrorHandler(message, status_code);
};

module.exports = throwError;
