const catchAsyncError = require("../helpers/catchAsyncError");
const { returnMessage } = require("../utils/utils");
const statusCode = require("../messages/statusCodes.json");
const NotificationService = require("../services/notificationService");
const { sendResponse } = require("../utils/sendResponse");
const notificationService = new NotificationService();

// create ------

exports.addNotification = catchAsyncError(async (req, res, next) => {
  const notification = await notificationService.addNotification(req?.body);
  sendResponse(
    res,
    true,
    returnMessage("notification", "messageAdded"),
    notification,
    statusCode.success
  );
});

// Get Notification ------

exports.getNotification = catchAsyncError(async (req, res, next) => {
  const notification = await notificationService.getNotification(
    req?.user,
    req?.query
  );
  sendResponse(
    res,
    true,
    returnMessage("notification", "notificationFetched"),
    notification,
    statusCode.success
  );
});

// Read notification ------

exports.getNotification = catchAsyncError(async (req, res, next) => {
  const notification = await notificationService.readNotification(
    req?.body,
    req?.user
  );
  sendResponse(
    res,
    true,
    returnMessage("notification", "notificationRead"),
    notification,
    statusCode.success
  );
});
