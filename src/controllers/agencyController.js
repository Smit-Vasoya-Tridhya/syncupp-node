const catchAsyncError = require("../helpers/catchAsyncError");
const AgencyService = require("../services/agencyService");
const { sendResponse } = require("../utils/sendResponse");
const { returnMessage } = require("../utils/utils");
const agencyService = new AgencyService();
const statusCode = require("../messages/statusCodes.json");

exports.getAllAgency = catchAsyncError(async (req, res, next) => {
  const agencies = await agencyService.allAgencies(req.body);
  sendResponse(res, true, null, agencies, statusCode.success);
});

exports.updateAgency = catchAsyncError(async (req, res, next) => {
  await agencyService.updateAgencyStatus(req.body);
  sendResponse(
    res,
    true,
    returnMessage("agency", "agencyUpdated"),
    {},
    statusCode.success
  );
});
