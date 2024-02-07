const catchAsyncError = require("../helpers/catchAsyncError");
const { returnMessage } = require("../utils/utils");
const statusCode = require("../messages/statusCodes.json");
const CouponService = require("../services/couponService");
const { sendResponse } = require("../utils/sendResponse");
const couponService = new CouponService();

// Add coupon

exports.addCoupon = catchAsyncError(async (req, res, next) => {
  const addedCoupen = await couponService.addCoupon(req.body);
  sendResponse(
    res,
    true,
    returnMessage("admin", "couponAdded"),
    addedCoupen,
    statusCode.success
  );
});

// // get All FQA

// exports.getAllFaq = catchAsyncError(async (req, res, next) => {
//   const faqs = await couponService.getAllFaq(req.body);
//   sendResponse(
//     res,
//     true,
//     returnMessage("admin", "getAllFaq"),
//     faqs,
//     statusCode.success
//   );
// });

// delete coupon

exports.deleteCoupon = catchAsyncError(async (req, res, next) => {
  await couponService.deleteFaq(req?.body);
  sendResponse(
    res,
    true,
    returnMessage("admin", "deleteFaq"),
    null,
    statusCode.success
  );
});

// Update coupon

exports.updateCoupon = catchAsyncError(async (req, res, next) => {
  const updatedFaq = await couponService.updateFaq(req.body, req?.params?.id);
  sendResponse(
    res,
    true,
    returnMessage("admin", "faqUpdated"),
    updatedFaq,
    statusCode.success
  );
});

// Get coupon

exports.getCoupon = catchAsyncError(async (req, res, next) => {
  const getCoupon = await couponService.getCoupon(req?.params?.id);
  sendResponse(
    res,
    true,
    returnMessage("admin", "getCoupon"),
    getCoupon,
    statusCode.success
  );
});
