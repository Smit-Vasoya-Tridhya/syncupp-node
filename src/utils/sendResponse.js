const sendResponse = (
  response,
  success = true,
  message = "Fetched Successfully!",
  data,
  statusCode = 200,
  pagination
) => {
  response.status(statusCode).json({
    success,
    message,
    data,
    status: statusCode,
    pagination: pagination,
  });
};

module.exports = { sendResponse };
