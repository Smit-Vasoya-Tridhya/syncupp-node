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
  let message = verified?.message;
  if (!verified?.success) message = returnMessage("payment", "paymentFailed");
  sendResponse(res, true, message, verified, 200);
});

exports.singleTimePayment = catchAsyncError(async (req, res, next) => {
  const order = await paymentService.oneTimePayment(req.body, req.user);
  sendResponse(res, true, returnMessage("payment", "orderCreated"), order, 200);
});

exports.paymentHistory = catchAsyncError(async (req, res, next) => {
  const histories = await paymentService.paymentHistory(req.body, req.user);
  sendResponse(
    res,
    true,
    returnMessage("payment", "paymentHistoryFetched"),
    histories,
    200
  );
});

exports.sheetsListing = catchAsyncError(async (req, res, next) => {
  const sheets = await paymentService.sheetsListing(req.body, req.user);
  sendResponse(
    res,
    true,
    returnMessage("payment", "sheetsFetched"),
    sheets,
    200
  );
});

exports.removeUser = catchAsyncError(async (req, res, next) => {
  await paymentService.removeUser(req.params.userId, req.user);
  sendResponse(res, true, returnMessage("payment", "userRemoved"), {}, 200);
});

exports.cancelSubscription = catchAsyncError(async (req, res, next) => {
  await paymentService.cancelSubscription(req.user);
  sendResponse(
    res,
    true,
    returnMessage("payment", "subscriptionCancelled"),
    {},
    200
  );
});

exports.getSubscriptionDetail = catchAsyncError(async (req, res, next) => {
  const subscription_detail = await paymentService.getSubscription(req.user);
  sendResponse(
    res,
    true,
    returnMessage("payment", "subscriptionFetched"),
    subscription_detail,
    200
  );
});
