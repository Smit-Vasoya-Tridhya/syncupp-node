const catchAsyncError = require("../helpers/catchAsyncError");
const { returnMessage } = require("../utils/utils");
const statusCode = require("../messages/statusCodes.json");
const AgencyService = require("../services/agencyService");
const { sendResponse } = require("../utils/sendResponse");
const agencyService = new AgencyService();

// Agency get Profile
exports.getAgencyProfile = catchAsyncError(async (req, res, next) => {
  const user_id = req?.user?._id;
  const agency = await agencyService.getAgencyProfile(user_id);
  sendResponse(
    res,
    true,
    returnMessage("agency", "agencyGet"),
    agency,
    statusCode.success
  );
});

// Agency update profile
exports.updateAgencyProfile = catchAsyncError(async (req, res, next) => {
  const user_id = req?.user?._id;
  const reference_id = req?.user?.reference_id;
  await agencyService.updateAgencyProfile(req.body, user_id, reference_id);

  sendResponse(
    res,
    true,
    returnMessage("agency", "agencyUpdate"),
    null,
    statusCode.success
  );
});
