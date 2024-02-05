const Activity = require("../models/activitySchema");
const ActivityStatus = require("../models/masters/activityStatusMasterSchema");
const ActivityType = require("../models/masters/activityTypeMasterSchema");
const logger = require("../logger");
const { throwError } = require("../helpers/errorUtil");
const {
  returnMessage,
  paginationObject,
  getKeywordType,
} = require("../utils/utils");
const moment = require("moment");
class ActivityService {
  createTask = async (payload, id) => {
    try {
      const {
        title,
        internal_info,
        due_date,
        due_time,
        assign_to,
        client_id,
        mark_as_done,
      } = payload;

      const dueDateObject = moment(due_date);
      const duetimeObject = moment(due_time);

      const timeOnly = duetimeObject.format("HH:mm:ss");
      dueDateObject.startOf("day");

      const currentDate = moment().startOf("day");

      if (dueDateObject.isSameOrBefore(currentDate)) {
        return returnMessage("activity", "dateinvalid");
      }
      let status;
      if (mark_as_done === true) {
        status = await ActivityStatus.findOne({ name: "completed" }).lean();
      } else {
        status = await ActivityStatus.findOne({ name: "pending" }).lean();
      }

      const type = await ActivityType.findOne({ name: "task" }).lean();

      const newTask = new Activity({
        title,
        internal_info,
        due_date: dueDateObject.toDate(),
        due_time: timeOnly,
        assign_to,
        assign_by: id,
        client_id,
        activity_status: status._id,
        activity_type: type._id,
      });
      return newTask.save();
    } catch (error) {
      logger.error(`Error while creating task : ${error}`);
      return throwError(error?.message, error?.statusCode);
    }
  };

  activityStatus = async () => {
    try {
      return await ActivityStatus.find();
    } catch (error) {
      logger.error(`Error while fetch list : ${error}`);
      return throwError(error?.message, error?.statusCode);
    }
  };

  taskList = async (searchObj) => {
    try {
      const queryObj = { is_deleted: false };
      const pagination = paginationObject(searchObj);

      if (searchObj.search && searchObj.search !== "") {
        queryObj["$or"] = [
          {
            title: {
              $regex: searchObj.search.toLowerCase(),
              $options: "i",
            },
          },

          {
            status: {
              $regex: searchObj.search.toLowerCase(),
              $options: "i",
            },
          },
        ];

        const keywordType = getKeywordType(searchObj.search);
        if (keywordType === "number") {
          const numericKeyword = parseInt(searchObj.search);

          queryObj["$or"].push({
            revenue_made: numericKeyword,
          });
        } else if (keywordType === "date") {
          const dateKeyword = new Date(searchObj.search);
          queryObj["$or"].push({ due_date: dateKeyword });
          queryObj["$or"].push({ updatedAt: dateKeyword });
        }
      }
      const taskPipeline = [
        {
          $lookup: {
            from: "authentications",
            localField: "assign_by",
            foreignField: "_id",
            as: "client_Data",
          },
        },
        // {
        //   $unwind: "$client_Data",
        // },
        {
          $lookup: {
            from: "authentications",
            localField: "assign_to",
            foreignField: "_id",
            as: "team_Data",
          },
        },
        {
          $unwind: "$team_Data",
        },
        {
          $match: queryObj,
        },
        {
          $project: {
            contact_number: 1,
            title: 1,
            status: 1,
            due_time: 1,
            due_date: 1,
          },
        },
      ];
      const activity = await Activity.aggregate(taskPipeline)
        .skip(pagination.skip)
        .limit(pagination.result_per_page)
        .sort(pagination.sort);

      const totalAgreementsCount = await Activity.countDocuments(queryObj);

      // Calculating total pages
      const pages = Math.ceil(
        totalAgreementsCount / pagination.result_per_page
      );

      return {
        activity,
        page_count: pages,
      };
    } catch (error) {
      logger.error(`Error while fetch list : ${error}`);
      return throwError(error?.message, error?.statusCode);
    }
  };
}

module.exports = ActivityService;
