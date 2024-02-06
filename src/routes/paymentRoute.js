const paymentRoute = require("express").Router();
const paymentConrtoller = require("../controllers/paymentController");
const { protect } = require("../middlewares/authMiddleware");

paymentRoute.post("/plan-create", paymentConrtoller.createPlan);
paymentRoute.post("/webhook", paymentConrtoller.webHookHandler);
paymentRoute.post("/verify-signature", paymentConrtoller.verifySignature);

paymentRoute.use(protect);
paymentRoute.post("/order", paymentConrtoller.singleTimePayment);
paymentRoute.post("/create-subscription", paymentConrtoller.createSubscription);

module.exports = paymentRoute;
