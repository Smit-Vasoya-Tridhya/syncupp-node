const Agency = require("../models/agencySchema");
const logger = require("../logger");
const { throwError } = require("../helpers/errorUtil");
const {
  returnMessage,
  paginationObject,
  getKeywordType,
} = require("../utils/utils");
const Role_Master = require("../models/masters/roleMasterSchema");
const Authentication = require("../models/authenticationSchema");

class AgencyService {
  agencyRegistration = async (payload) => {
    try {
      return await Agency.create(payload);
    } catch (error) {
      logger.error(`Error while registering the agency: ${error}`);
      return throwError(returnMessage("default", "default"), error?.statusCode);
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
        ];

        const keyword_type = getKeywordType(payload.search);
        if (keyword_type === "number") {
          query_obj["$or"].push({ contact_number: parseInt(payload.search) });
        }
      }

      const [agencyList, totalAgency] = await Promise.all([
        Authentication.find(query_obj)
          .populate({ path: "reference_id", model: "agency" })
          .sort(pagination.sort)
          .skip(pagination.skip)
          .limit(pagination.result_per_page)
          .lean(),
        Authentication.find(query_obj)
          .populate({
            path: "reference_id",
            model: "agency",
          })
          .lean(),
      ]);

      return {
        agencyList,
        page_count:
          Math.ceil(totalAgency.length / pagination.result_per_page) || 0,
      };
    } catch (error) {
      logger.error(`Error while getting agency list: ${error}`);
      return throwError(returnMessage("default", "default"), error?.statusCode);
    }
  };

  // admin only have rights to update the status and delete
  updateAgencyStatus = async (payload) => {
    try {
      const update_obj = {};
      if (payload?.status && payload?.status !== "")
        update_obj.status = payload?.status;
      else if (payload?.delete) update_obj.is_deleted = true;

      await Authentication.updateMany(
        { _id: { $in: payload?.agencies } },
        update_obj,
        { new: true }
      );

      return true;
    } catch (error) {
      logger.error(`Error while updating an agency status: ${error}`);
      return throwError(returnMessage("default", "default"), error?.statusCode);
    }
  };
}

module.exports = AgencyService;
