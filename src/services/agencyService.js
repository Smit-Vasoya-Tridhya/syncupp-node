const Agency = require("../models/agencySchema");
const logger = require("../logger");
const { throwError } = require("../helpers/errorUtil");
const { paginationObject, capitalizeFirstLetter } = require("../utils/utils");
const Role_Master = require("../models/masters/roleMasterSchema");
const Authentication = require("../models/authenticationSchema");
const SubscriptionPlan = require("../models/subscriptionplanSchema");
const PaymentService = require("./paymentService");
const paymentService = new PaymentService();
const ReferralService = require("./referralService");
const referralService = new ReferralService();
// Register Agency
class AgencyService {
  agencyRegistration = async (payload) => {
    try {
      return await Agency.create(payload);
    } catch (error) {
      logger.error(`Error while registering the agency: ${error}`);
      return throwError(error?.message, error?.statusCode);
    }
  };

  // this will only avilabe for the admin panel
  allAgencies = async (payload) => {
    try {
      const role = await Role_Master.findOne({ name: "agency" })
        .select("_id")
        .lean();
      const pagination = paginationObject(payload);
      const query_obj = { role: role?._id, is_deleted: false };

      if (payload.search && payload.search !== "") {
        query_obj["$or"] = [
          {
            first_name: { $regex: payload.search, $options: "i" },
          },
          {
            last_name: { $regex: payload.search, $options: "i" },
          },
          {
            email: { $regex: payload.search, $options: "i" },
          },
          {
            contact_number: { $regex: payload.search, $options: "i" },
          },
          {
            "reference_id.company_name": {
              $regex: payload.search,
              $options: "i",
            },
          },
          {
            "reference_id.company_website": {
              $regex: payload.search,
              $options: "i",
            },
          },
          {
            "reference_id.no_of_people": {
              $regex: payload.search,
              $options: "i",
            },
          },
          {
            "reference_id.industry": {
              $regex: payload.search,
              $options: "i",
            },
          },
          {
            status: { $regex: payload.search, $options: "i" },
          },
        ];

        // const keyword_type = getKeywordType(payload.search);
        // if (keyword_type === "number") {
        //   query_obj["$or"].push({ contact_number: parseInt(payload.search) });
        // }
      }

      const aggragate = [
        {
          $lookup: {
            from: "agencies",
            localField: "reference_id",
            foreignField: "_id",
            as: "reference_id",
            pipeline: [
              {
                $project: {
                  company_name: 1,
                  company_website: 1,
                  industry: 1,
                  no_of_people: 1,
                },
              },
            ],
          },
        },
        { $unwind: "$reference_id" },
        { $match: query_obj },
      ];

      const [agencyList, total_agencies] = await Promise.all([
        Authentication.aggregate(aggragate)
          .sort(pagination.sort)
          .skip(pagination.skip)
          .limit(pagination.result_per_page),
        Authentication.aggregate(aggragate),
      ]);

      return {
        agencyList,
        page_count:
          Math.ceil(total_agencies.length / pagination.result_per_page) || 0,
      };
    } catch (error) {
      logger.error(`Error while getting agency list: ${error}`);
      return throwError(error?.message, error?.statusCode);
    }
  };

  // admin only have rights to update the status and delete
  updateAgencyStatus = async (payload) => {
    try {
      const update_obj = {};
      if (payload?.status && payload?.status !== "") {
        if (payload.status === "active") update_obj.status = "confirmed";
        else if (payload.status === "inactive")
          update_obj.status = "agency_inactive";
      } else if (payload?.delete) update_obj.is_deleted = true;

      await Authentication.updateMany(
        { _id: { $in: payload?.agencies }, status: { $ne: "payment_pending" } },
        update_obj,
        { new: true }
      );

      return true;
    } catch (error) {
      logger.error(`Error while updating an agency status: ${error}`);
      return throwError(error?.message, error?.statusCode);
    }
  };

  // Get Agency profile
  getAgencyProfile = async (agency) => {
    try {
      const [agency_detail, agency_reference, plan] = await Promise.all([
        Authentication.findById(agency?._id).select("-password").lean(),
        Agency.findById(agency?.reference_id)
          .populate("city", "name")
          .populate("state", "name")
          .populate("country", "name")
          .lean(),
        SubscriptionPlan.findOne({ active: true }).lean(),
      ]);
      agency_detail.reference_id = agency_reference;
      // removed because of the subscription api is gettign cancelled due to razorpay api call
      // const [subscription_detail, check_referral] = await Promise.all([
      //   paymentService.subscripionDetail(agency_detail?.subscription_id),
      //   referralService.checkReferralAvailable(agency),
      // ]);
      // agency_detail.payable_amount = (
      //   paymentService.customPaymentCalculator(
      //     subscription_detail?.current_start,
      //     subscription_detail?.current_end,
      //     plan
      //   ) / 100
      // ).toFixed(2);
      // // let check_referral = await referralService.checkReferralAvailable(agency);
      // agency_detail.check_referral = check_referral.referralAvailable;
      return agency_detail;
    } catch (error) {
      logger.error(`Error while registering the agency: ${error}`);
      return throwError(error?.message, error?.statusCode);
    }
  };

  // Update Agency profile
  updateAgencyProfile = async (payload, user_id, reference_id) => {
    try {
      const {
        first_name,
        last_name,
        contact_number,
        company_name,
        company_website,
        no_of_people,
        industry,
        city,
        address,
        state,
        country,
        pincode,
      } = payload;

      const authData = {
        first_name,
        last_name,
        contact_number,
        name:
          capitalizeFirstLetter(first_name) +
          " " +
          capitalizeFirstLetter(last_name),
      };
      const agencyData = {
        company_name,
        company_website,
        no_of_people,
        industry,
        city,
        address,
        state,
        country,
        pincode,
      };

      await Promise.all([
        Authentication.updateOne(
          { _id: user_id },
          { $set: authData },
          { new: true }
        ),
        Agency.updateOne(
          { _id: reference_id },
          { $set: agencyData },
          { new: true }
        ),
      ]);

      return;
    } catch (error) {
      logger.error(`Error while registering the agency: ${error}`);
      return throwError(error?.message, error?.statusCode);
    }
  };
}

module.exports = AgencyService;
