const catchAsyncError = require("../helpers/catchAsyncError");
const { sendResponse } = require("../utils/sendResponse");
const { throwError } = require("../helpers/errorUtil");
const ReferralService = require("../services/referralService");
const { returnMessage } = require("../utils/utils");
const referralService = new ReferralService();

exports.checkRefferal = catchAsyncError(async (req, res, next) => {
  const checkRefferal = await referralService.checkReferralAvailable(req.user);
  sendResponse(
    res,
    true,
    returnMessage("referral", "checkRefferal"),
    checkRefferal,
    200
  );
});
