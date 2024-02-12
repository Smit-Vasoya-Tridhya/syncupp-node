const catchAsyncError = require("../helpers/catchAsyncError");
const { returnMessage } = require("../utils/utils");
const statusCode = require("../messages/statusCodes.json");
const CmsService = require("../services/cmsService");
const { sendResponse } = require("../utils/sendResponse");
const cmsService = new CmsService();

// Add   Contact CMS

exports.addContactUs = catchAsyncError(async (req, res, next) => {
  const data = await cmsService.addContactUs(req.body);
  sendResponse(
    res,
    true,
    returnMessage("crm", "contactUpdated"),
    data,
    statusCode.success
  );
});

// Get   Contact CMS

exports.getContactUs = catchAsyncError(async (req, res, next) => {
  const data = await cmsService.getContactUs();
  sendResponse(
    res,
    true,
    returnMessage("crm", "contactFetched"),
    data,
    statusCode.success
  );
});

// Add   Privacy Policy CMS

exports.addPrivacyPolicy = catchAsyncError(async (req, res, next) => {
  const data = await cmsService.addPrivacyPolicy(req.body);
  sendResponse(res, true, returnMessage("crm", ""), data, statusCode.success);
});
