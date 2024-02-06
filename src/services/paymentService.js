const Razorpay = require("razorpay");
const logger = require("../logger");
const { throwError } = require("../helpers/errorUtil");
const SubscriptionPlan = require("../models/subscriptionplanSchema");
const Authentication = require("../models/authenticationSchema");
const Client = require("../models/clientSchema");
const Team_Agency = require("../models/teamAgencySchema");
const Team_Client = require("../models/teamClientSchema");
const { returnMessage } = require("../utils/utils");
const statusCode = require("../messages/statusCodes.json");
const crypto = require("crypto");
const moment = require("moment");
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

class PaymentService {
  createPlan = async () => {
    try {
      const planExist = await SubscriptionPlan.findOne({
        period: "monthly",
      }).lean();
      if (planExist) return throwError(returnMessage("payment", "planExist"));

      const planData = {
        period: "monthly",
        interval: 1, // Charge every month
        item: {
          name: "1 month plan",
          description: "One month plan for the agencies.",
          amount: 6000 * 100, // Amount in paise (6000 INR)
          currency: "INR",
        },
      };
      const plan = await Promise.resolve(razorpay.plans.create(planData));

      await SubscriptionPlan.create({
        amount: 600000,
        currency: "INR",
        description: "One month plan for the agencies.",
        plan_id: plan?.id,
        period: "monthly",
        name: "1 month plan",
      });
      return;
    } catch (error) {
      console.log(error);
      logger.error(`Error while creating the plan: ${error}`);
      return throwError(error?.message, error?.statusCode);
    }
  };

  subscription = async (user) => {
    try {
      if (user?.role?.name !== "agency")
        return throwError(
          returnMessage("auth", "forbidden"),
          statusCode.forbidden
        );

      if (
        (user?.subscription_id && user?.subscribe_date) ||
        user?.status !== "payment_pending"
      )
        return throwError(returnMessage("payment", "alreadyPaid"));
      const plan = await SubscriptionPlan.findOne({
        period: "monthly",
        amount: 600000,
      }).lean();

      if (!plan)
        return throwError(
          returnMessage("payment", "planNotFound"),
          statusCode.notFound
        );
      // notify_info: {
      //   notify_phone: +919574504819,
      //   notify_email: "smitvtridhyaetech@gmail.com",
      // },
      const subscription_obj = {
        plan_id: plan?.plan_id,
        quantity: 1,
        customer_notify: 1,
        total_count: 240,
      };
      const subscription = await Promise.resolve(
        razorpay.subscriptions.create(subscription_obj)
      );

      await Authentication.findByIdAndUpdate(
        user?._id,
        { subscription_id: subscription?.id },
        { new: true }
      );

      return {
        payment_id: subscription?.id,
        amount: plan?.amount,
        currency: plan?.currency,
      };
    } catch (error) {
      console.log(error);
      logger.error(`Error while creating subscription: ${error}`);
      return throwError(
        error?.message || error?.error?.description,
        error?.statusCode
      );
    }
  };

  webHookHandlar = async (request) => {
    try {
      const { body, headers } = request;

      // verify webhook signature is commented because it is not working for the invoice paid event
      // const razorpaySignature = headers["x-razorpay-signature"];
      // const signature = crypto
      //   .createHmac("sha256", process.env.WEBHOOK_SECRET)
      //   .update(JSON.stringify(body))
      //   .digest("hex");
      //   if (razorpaySignature !== signature)
      //     return throwError(
      //       returnMessage("payment", "invalidSignature"),
      //       statusCode.forbidden
      //     );

      console.log(JSON.stringify(body), 100);

      return;
    } catch (error) {
      console.log(`Error with webhook handler`, error);
      return throwError(
        error?.message || error?.error?.description,
        error.status
      );
    }
  };

  customPaymentCalculator = (subscription_date, plan) => {
    try {
      const registrationMoment = moment(subscription_date, "YYYY-MM-DD");
      const paymentMoment = moment();

      // Calculate the number of days remaining in the month from the registration date
      const daysInMonth = registrationMoment.daysInMonth();
      const remainingDays = daysInMonth - registrationMoment.date() + 1;

      // Calculate the prorated amount based on the remaining days
      const proratedAmount = (remainingDays / daysInMonth) * plan?.amount;

      // Adjust the payment if the user is created in a different month
      if (registrationMoment.month() !== paymentMoment.month()) {
        // Calculate the remaining days in the payment month
        const remainingDaysInPaymentMonth = paymentMoment.date();

        // Adjust the prorated amount based on the days in the payment month
        const adjustedProratedAmount =
          (remainingDaysInPaymentMonth / daysInMonth) * plan?.amount;

        return adjustedProratedAmount.toFixed(2);
      }

      return proratedAmount.toFixed(2);
    } catch (error) {
      logger.error(`Error while calculating the custom payment: ${error}`);
      return throwError(error?.message, error?.statusCode);
    }
  };

  oneTimePayment = async (payload, user) => {
    try {
      if (user?.role?.name !== "agency")
        return throwError(
          returnMessage("auth", "forbidden"),
          statusCode.forbidden
        );

      if (
        user?.status === "payment_pending" ||
        !user?.subscribe_date ||
        !user?.subscription_id
      )
        return throwError(returnMessage("payment", "agencyPaymentPending"));

      if (!payload?.user_id)
        return throwError(returnMessage("payment", "userIdRequried"));

      const plan = await SubscriptionPlan.findOne({
        period: "monthly",
        amount: 600000,
      }).lean();

      if (!plan)
        return throwError(
          returnMessage("payment", "planNotFound"),
          statusCode.notFound
        );
      const prorate_value = parseInt(
        this.customPaymentCalculator(user?.subscribe_date, plan)
      );

      const order = await Promise.resolve(
        razorpay.orders.create({
          amount: prorate_value,
          currency: "INR",
          receipt: Date.now().toString(),
        })
      );

      await Authentication.findByIdAndUpdate(
        payload?.user_id,
        { order_id: order?.id },
        { new: true }
      );
      return {
        payment_id: order?.id,
        amount: plan?.amount,
        currency: plan?.currency,
      };
    } catch (error) {
      logger.error(`Error while doing the one time payment: ${error}`);
      return throwError(
        error?.message || error?.error?.description,
        error?.statusCode
      );
    }
  };

  verifySignature = async (payload) => {
    try {
      const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
        payload;

      const expected_signature = crypto
        .createHmac("sha256", process.env.RAZORPAY_SECRET)
        .update(razorpay_payment_id + "|" + razorpay_order_id, "utf-8")
        .digest("hex");

      if (expected_signature === razorpay_signature) return { success: true };
      return { success: false };
    } catch (error) {
      logger.error(`Error while verifying signature: ${error}`);
      return throwError(
        error?.message || error?.error?.description,
        error?.statusCode
      );
    }
  };

  checkAgencyExist = async (user_id, agency_id) => {
    try {
      const user_exist = await Authentication.findOne({
        reference_id: user_id,
      })
        .populate("role", "name")
        .lean();

      if (!user_exist)
        return throwError(
          returnMessage("auth", "userNotFound"),
          statusCode?.notFound
        );

      if (user?.role?.name === "client") {
        const client_exist = await Client.findOne({
          agency_ids: {
            $elemMatch: {
              agency_id: agency_id,
              status: "pending",
            },
          },
        });

        if (!client_exist) return false;
        return true;
      } else if (user?.role?.name === "team_agency") {
        // const team_agency_exist = await Authentication.findOne({reference_id:});
      } else if (user?.role?.name === "team_client") {
      }
      return false;
    } catch (error) {
      logger.error(`Error while checking agency exist: ${error}`);
      return false;
    }
  };
}

module.exports = PaymentService;
