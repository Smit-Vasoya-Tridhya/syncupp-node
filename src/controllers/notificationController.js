const catchAsyncError = require("../helpers/catchAsyncError");
const { returnMessage } = require("../utils/utils");
const statusCode = require("../messages/statusCodes.json");
const NotificationService = require("../services/notificationService");
const { sendResponse } = require("../utils/sendResponse");
const notificationService = new NotificationService();

// Add Clients ------   AGENCY API

exports.notificationService = catchAsyncError(async (req, res, next) => {
  const notification = await notificationService.addNotification(req?.user);
  sendResponse(
    res,
    true,
    returnMessage("notification", "messageAdded"),
    notification,
    statusCode.success
  );
});
