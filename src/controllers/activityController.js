const catchAsyncError = require("../helpers/catchAsyncError");
const { returnMessage } = require("../utils/utils");
const statusCode = require("../messages/statusCodes.json");
const ActivityService = require("../services/activityService");
const { sendResponse } = require("../utils/sendResponse");
const activityService = new ActivityService();

exports.addTask = catchAsyncError(async (req, res, next) => {
  const createTask = await activityService.createTask(req.body, req?.user?._id);
  sendResponse(
    res,
    true,
    returnMessage("activity", "createTask"),
    createTask,
    statusCode.success
  );
});

exports.statusList = catchAsyncError(async (req, res, next) => {
  const statusList = await activityService.activityStatus();
  sendResponse(
    res,
    true,
    returnMessage("activity", "statusList"),
    statusList,
    statusCode.success
  );
});

exports.taskList = catchAsyncError(async (req, res, next) => {
  const taskList = await activityService.taskList(req.body);
  sendResponse(
    res,
    true,
    returnMessage("activity", "taskList"),
    taskList,
    statusCode.success
  );
});
