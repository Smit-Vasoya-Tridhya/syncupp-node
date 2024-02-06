const catchAsyncError = require("../helpers/catchAsyncError");
const { sendResponse } = require("../utils/sendResponse");
const { throwError } = require("../helpers/errorUtil");
const PaymentService = require("../services/paymentService");
const { returnMessage } = require("../utils/utils");
const paymentService = new PaymentService();

exports.createPlan = catchAsyncError(async (req, res, next) => {
  await paymentService.createPlan();
  sendResponse(res, true, returnMessage("payment", "planCreated"), {}, 200);
});

exports.createSubscription = catchAsyncError(async (req, res, next) => {
  const subscription = await paymentService.subscription(req.user);
  sendResponse(
    res,
    true,
    returnMessage("payment", "checkoutLinkGenerated"),
    subscription,
    200
  );
});

exports.webHookHandler = catchAsyncError(async (req, res, next) => {
  await paymentService.webHookHandlar(req);
  sendResponse(res, true, "", {}, 200);
});

exports.verifySignature = catchAsyncError(async (req, res, next) => {
  const verified = await paymentService.verifySignature(req.body);
  let message = returnMessage("payment", "paymentCompleted");
  if (!verified?.success) message = returnMessage("payment", "paymentFailed");
  sendResponse(res, true, message, verified, 200);
});

exports.singleTimePayment = catchAsyncError(async (req, res, next) => {
  const order = await paymentService.oneTimePayment(req.body, req.user);
  sendResponse(res, true, returnMessage("payment", "orderCreated"), order, 200);
});