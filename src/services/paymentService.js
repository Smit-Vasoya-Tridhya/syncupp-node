const Razorpay = require("razorpay");
const logger = require("../logger");
const { throwError } = require("../helpers/errorUtil");
const SubscriptionPlan = require("../models/subscriptionplanSchema");
const Authentication = require("../models/authenticationSchema");
const Client = require("../models/clientSchema");
const Team_Agency = require("../models/teamAgencySchema");
const Team_Client = require("../models/teamClientSchema");
const PaymentHistory = require("../models/paymentHistorySchema");
const SheetManagement = require("../models/sheetManagementSchema");
const { returnMessage, invitationEmail } = require("../utils/utils");
const statusCode = require("../messages/statusCodes.json");
const crypto = require("crypto");
const moment = require("moment");
const sendEmail = require("../helpers/sendEmail");
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

class PaymentService {
  createPlan = async (payload) => {
    try {
      // const planExist = await SubscriptionPlan.findOne({
      //   period: "monthly",
      // }).lean();
      // if (planExist) return throwError(returnMessage("payment", "planExist"));

      const planData = {
        period: payload?.period,
        interval: 1, // Charge every month
        item: {
          name: payload?.name,
          description: payload?.description,
          amount: payload?.amount * 100, // Amount in paise (6000 INR)
          currency: payload?.currency,
        },
      };
      const plan = await Promise.resolve(razorpay.plans.create(planData));

      if (plan) {
        await SubscriptionPlan.updateMany({}, { active: false }, { new: true });
        await SubscriptionPlan.create({
          amount: payload?.amount * 100,
          currency: payload?.currency,
          description: payload?.description,
          plan_id: plan?.id,
          period: payload?.period,
          name: payload?.name,
          active: true,
        });
      }

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
      const plan = await SubscriptionPlan.findOne({ active: true }).lean();

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
        agency_id: user?.reference_id,
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
      console.log(error);
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

      const agency_exist = await this.checkAgencyExist(
        payload?.user_id,
        user?.reference_id
      );

      if (!agency_exist) return throwError(returnMessage("default", "default"));

      const plan = await SubscriptionPlan.findOne({ active: true }).lean();

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
        user_id: payload?.user_id,
        agency_id: user?.reference_id,
      };
    } catch (error) {
      console.log(error);
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

      const expected_signature_1 = crypto
        .createHmac("sha256", process.env.RAZORPAY_SECRET)
        .update(razorpay_payment_id + "|" + razorpay_order_id, "utf-8")
        .digest("hex");
      const expected_signature_2 = crypto
        .createHmac("sha256", process.env.RAZORPAY_SECRET)
        .update(razorpay_order_id + "|" + razorpay_payment_id, "utf-8")
        .digest("hex");

      if (
        expected_signature_1 === razorpay_signature ||
        expected_signature_2 === razorpay_signature
      ) {
        const status_change = await this.statusChange(payload);
        if (!status_change) return { success: false };
        return { success: true };
      }

      await this.deleteUsers(payload);
      return { success: false };
    } catch (error) {
      console.log(error);
      logger.error(`Error while verifying signature: ${error}`);
      return throwError(
        error?.message || error?.error?.description,
        error?.statusCode
      );
    }
  };

  // this function is used to check the agency is exist when doing the custompayment(single payment)
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

      if (user_exist?.role?.name === "client") {
        const client_exist = await Client.findOne({
          agency_ids: {
            $elemMatch: {
              agency_id,
              status: "payment_pending",
            },
          },
        });

        if (!client_exist) return false;
        return true;
      } else if (user_exist?.role?.name === "team_agency") {
        const team_agency_exist = await Team_Agency.findOne({
          agency_id,
        }).lean();
        if (!team_agency_exist || user_exist?.status === "confirmed")
          return false;
        return true;
      } else if (user_exist?.role?.name === "team_client") {
        const team_client_exist = await Team_Client.findOne({
          agency_ids: {
            $elemMatch: {
              agency_id,
              status: "requested",
            },
          },
        });
        if (!team_client_exist) return false;
        return true;
      }
      return false;
    } catch (error) {
      console.log(error);
      logger.error(`Error while checking agency exist: ${error}`);
      return false;
    }
  };

  // create the payemnt history and change the status based on that
  statusChange = async (payload) => {
    try {
      const {
        agency_id,
        user_id,
        amount,
        subscription_id,
        razorpay_order_id,
        currency,
      } = payload;
      if (payload?.agency_id && !payload?.user_id) {
        await Authentication.findOneAndUpdate(
          { reference_id: agency_id },
          {
            status: "confirmed",
            subscribe_date: moment().format("YYYY-MM-DD").toString(),
          }
        );
        await PaymentHistory.create({
          agency_id,
          amount,
          subscription_id,
          currency,
        });

        await SheetManagement.findOneAndUpdate(
          { agency_id },
          {
            agency_id,
            total_sheets: 1,
            occupied_sheets: [],
          },
          { upsert: true }
        );
        return true;
      } else if (payload?.agency_id && payload?.user_id) {
        const agency_details = await Authentication.findOne({
          reference_id: agency_id,
        }).lean();
        const user_details = await Authentication.findOne({
          reference_id: payload?.user_id,
        })
          .populate("role", "name")
          .lean();

        if (user_details?.role?.name === "client") {
          let link = `${
            process.env.REACT_APP_URL
          }/client/verify?name=${encodeURIComponent(
            agency_details?.first_name + " " + agency_details?.last_name
          )}&email=${encodeURIComponent(
            user_details?.email
          )}&agency=${encodeURIComponent(agency_details?.reference_id)}`;

          const invitation_mail = invitationEmail(link, user_details.name);

          await sendEmail({
            email: user_details?.email,
            subject: returnMessage("emailTemplate", "invitation"),
            message: invitation_mail,
          });
          await Client.updateOne(
            { _id: user_id, "agency_ids.agency_id": agency_id },
            { $set: { "agency_ids.$.status": "pending" } },
            { new: true }
          );
        } else if (user_details?.role?.name === "team_agency") {
          const link = `${process.env.REACT_APP_URL}/team/verify?agency=${
            agency_details?.first_name + " " + agency_details?.last_name
          }&agencyId=${agency_details?.reference_id}&email=${encodeURIComponent(
            user_details?.email
          )}&token=${user_details?.invitation_token}&redirect=false`;

          const invitation_template = invitationEmail(link, user_details?.name);

          await sendEmail({
            email: user_details?.email,
            subject: returnMessage("emailTemplate", "invitation"),
            message: invitation_template,
          });
        } else if (user_details?.role?.name === "team_client") {
          const link = `${process.env.REACT_APP_URL}/team/verify?agency=${
            agency_details?.first_name + " " + agency_details?.last_name
          }&agencyId=${agency_details?.reference_id}&email=${encodeURIComponent(
            user_details?.email
          )}`;

          const invitation_template = invitationEmail(link, user_details?.name);

          await sendEmail({
            email: user_details?.email,
            subject: returnMessage("emailTemplate", "invitation"),
            message: invitation_template,
          });
        }

        await PaymentHistory.create({
          agency_id,
          user_id,
          amount,
          order_id: razorpay_order_id,
          currency,
          role: user_details?.role?.name,
        });

        const sheets = await SheetManagement.findOne({ agency_id }).lean();
        if (!sheets) return false;
        const occupied_sheets = [
          ...sheets.occupied_sheets,
          {
            user_id,
            role: user_details?.role?.name,
          },
        ];

        const sheet_obj = {
          total_sheets: sheets?.total_sheets + 1,
          occupied_sheets,
        };
        await SheetManagement.findByIdAndUpdate(sheets._id, sheet_obj);
        return true;
      }
      return false;
    } catch (error) {
      console.log(error);

      logger.error(`Error while changing status after the payment: ${error}`);
      return false;
    }
  };

  // this functio will use if the signature fails to verify after the payment
  deleteUsers = async (payload) => {
    try {
      const { user_id } = payload;
      const user_details = await Authentication.findOne({
        reference_id: user_id,
      })
        .populate("role", "name")
        .lean();
      if (user_details?.role?.name === "team_agency") {
        await Authentication.findByIdAndDelete(user_details._id);
        await Team_Agency.findByIdAndDelete(user_details.reference_id);
      }
      return;
    } catch (error) {
      console.log(error);

      logger.error(`Error while deleting the User: ${error}`);
      return false;
    }
  };
}

module.exports = PaymentService;
