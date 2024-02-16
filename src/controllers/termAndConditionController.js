const catchAsyncError = require("../helpers/catchAsyncError");
const { returnMessage } = require("../utils/utils");
const statusCode = require("../messages/statusCodes.json");
const TermAndConditionService = require("../services/termAndConditionService");
const { sendResponse } = require("../utils/sendResponse");
const termAndConditionService = new TermAndConditionService();

// Add TermAndCondition

exports.addTermAndCondition = catchAsyncError(async (req, res, next) => {
  const addedTermAndCondition = await termAndConditionService.addTermAndCondition(req.body);
  sendResponse(
    res,
    true,
    returnMessage("admin", "TermAndConditionAdded"),
    addedTermAndCondition,
    statusCode.success
  );
});

