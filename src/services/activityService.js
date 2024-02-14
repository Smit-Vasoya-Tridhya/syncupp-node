const Activity = require("../models/activitySchema");
const ActivityStatus = require("../models/masters/activityStatusMasterSchema");
const ActivityType = require("../models/masters/activityTypeMasterSchema");
const logger = require("../logger");
const { throwError } = require("../helpers/errorUtil");
const {
  returnMessage,
  paginationObject,
  getKeywordType,
  validateRequestFields,
} = require("../utils/utils");
const moment = require("moment");
const { default: mongoose } = require("mongoose");
const Team_Agency = require("../models/teamAgencySchema");
const statusCode = require("../messages/statusCodes.json");
class ActivityService {
  createTask = async (payload, user) => {
    try {
      const {
        title,
        internal_info,
        due_date,
        // due_time,
        assign_to,
        client_id,
        mark_as_done,
      } = payload;
      let agency_id;
      if (user.role.name === "agency") {
        agency_id = user.reference_id;
      } else if (user.role.name === "team_agency") {
        const agencies = await Team_Agency.findOne({ agency_id: id }).lean();
        agency_id = agencies.agency_id;
      }
      console.log(user);
      const dueDateObject = moment(due_date);
      const duetimeObject = moment(due_date);

      const timeOnly = duetimeObject.format("HH:mm:ss");

      const currentDate = moment().startOf("day");

      if (dueDateObject.isSameOrBefore(currentDate)) {
        return throwError(returnMessage("activity", "dateinvalid"));
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
        assign_by: user._id,
        client_id,
        activity_status: status._id,
        activity_type: type._id,
        agency_id,
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

  taskList = async (searchObj, user) => {
    if (!searchObj.pagination) {
      try {
        const queryObj = { is_deleted: false, agency_id: user.reference_id };
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
            {
              "assign_by.first_name": {
                $regex: searchObj.search.toLowerCase(),
                $options: "i",
              },
            },
            {
              "team_Data.first_name": {
                $regex: searchObj.search.toLowerCase(),
                $options: "i",
              },
            },
            {
              "team_Data.last_name": {
                $regex: searchObj.search.toLowerCase(),
                $options: "i",
              },
            },
            {
              "assign_by.last_name": {
                $regex: searchObj.search.toLowerCase(),
                $options: "i",
              },
            },
            {
              "assign_by.assigned_by_name": {
                $regex: searchObj.search.toLowerCase(),
                $options: "i",
              },
            },
            {
              "team_Data.assigned_to_name": {
                $regex: searchObj.search,
                $options: "i",
              },
            },
            {
              "client_Data.client_name": {
                $regex: searchObj.search,
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
              localField: "client_id",
              foreignField: "reference_id",
              as: "client_Data",
              pipeline: [
                {
                  $project: {
                    name: 1,
                    first_name: 1,
                    last_name: 1,
                    client_name: {
                      $concat: ["$first_name", " ", "$last_name"],
                    },
                  },
                },
              ],
            },
          },
          {
            $unwind: "$client_Data",
          },
          {
            $lookup: {
              from: "authentications",
              localField: "assign_to",
              foreignField: "reference_id",
              as: "team_Data",
              pipeline: [
                {
                  $project: {
                    name: 1,
                    first_name: 1,
                    last_name: 1,
                    assigned_to_name: {
                      $concat: ["$first_name", " ", "$last_name"],
                    },
                  },
                },
              ],
            },
          },
          {
            $unwind: "$team_Data",
          },
          {
            $lookup: {
              from: "authentications",
              localField: "assign_by",
              foreignField: "_id",
              as: "assign_by",
              pipeline: [
                {
                  $project: {
                    name: 1,
                    first_name: 1,
                    last_name: 1,
                    assigned_by_name: {
                      $concat: ["$first_name", " ", "$last_name"],
                    },
                  },
                },
              ],
            },
          },
          {
            $unwind: "$assign_by",
          },
          {
            $lookup: {
              from: "activity_status_masters",
              localField: "activity_status",
              foreignField: "_id",
              as: "status",
              pipeline: [{ $project: { name: 1 } }],
            },
          },
          {
            $unwind: "$status",
          },
          {
            $match: queryObj,
          },
          {
            $project: {
              contact_number: 1,
              title: 1,
              status: "$status.name",
              due_time: 1,
              due_date: 1,
              createdAt: 1,
              internal_info: 1,
              assigned_by_first_name: "$assign_by.first_name",
              assigned_by_last_name: "$assign_by.last_name",
              assigned_to_first_name: "$team_Data.first_name",
              assigned_to_last_name: "$team_Data.last_name",
              assigned_to_name: "$team_Data.assigned_to_name",
              assigned_by_name: "$assign_by.assigned_by_name",
              client_name: "$client_Data.client_name",
              column_id: "$status.name",
            },
          },
        ];
        const activity = await Activity.aggregate(taskPipeline).sort({
          createdAt: -1,
        });
        // .skip(pagination.skip)
        // .limit(pagination.result_per_page);

        const totalAgreementsCount = await Activity.countDocuments(queryObj);

        // Calculating total pages
        const pages = Math.ceil(
          totalAgreementsCount / pagination.result_per_page
        );

        return {
          activity,
          // page_count: pages,
        };
      } catch (error) {
        logger.error(`Error while fetch list : ${error}`);
        return throwError(error?.message, error?.statusCode);
      }
    } else {
      try {
        const queryObj = { is_deleted: false, agency_id: user.reference_id };
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
            {
              "client_Data.client_name": {
                $regex: searchObj.search,
                $options: "i",
              },
            },
            {
              "assign_by.first_name": {
                $regex: searchObj.search.toLowerCase(),
                $options: "i",
              },
            },
            {
              "team_Data.first_name": {
                $regex: searchObj.search.toLowerCase(),
                $options: "i",
              },
            },
            {
              "team_Data.last_name": {
                $regex: searchObj.search.toLowerCase(),
                $options: "i",
              },
            },
            {
              "assign_by.last_name": {
                $regex: searchObj.search.toLowerCase(),
                $options: "i",
              },
            },
            {
              "assign_by.assigned_by_name": {
                $regex: searchObj.search.toLowerCase(),
                $options: "i",
              },
            },
            {
              "team_Data.assigned_to_name": {
                $regex: searchObj.search,
                $options: "i",
              },
            },
            // {
            //   assigned_by_name: {
            //     $regex: searchObj.search,
            //     $options: "i",
            //   },
            // },
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
              localField: "client_id",
              foreignField: "reference_id",
              as: "client_Data",
              pipeline: [
                {
                  $project: {
                    name: 1,
                    first_name: 1,
                    last_name: 1,
                    client_name: {
                      $concat: ["$first_name", " ", "$last_name"],
                    },
                  },
                },
              ],
            },
          },
          {
            $unwind: "$client_Data",
          },
          {
            $lookup: {
              from: "authentications",
              localField: "assign_to",
              foreignField: "reference_id",
              as: "team_Data",
              pipeline: [
                {
                  $project: {
                    name: 1,
                    first_name: 1,
                    last_name: 1,
                    assigned_to_name: {
                      $concat: ["$first_name", " ", "$last_name"],
                    },
                  },
                },
              ],
            },
          },
          {
            $unwind: "$team_Data",
          },
          {
            $lookup: {
              from: "authentications",
              localField: "assign_by",
              foreignField: "_id",
              as: "assign_by",
              pipeline: [
                {
                  $project: {
                    name: 1,
                    first_name: 1,
                    last_name: 1,
                    assigned_by_name: {
                      $concat: ["$first_name", " ", "$last_name"],
                    },
                  },
                },
              ],
            },
          },
          {
            $unwind: "$assign_by",
          },
          {
            $lookup: {
              from: "activity_status_masters",
              localField: "activity_status",
              foreignField: "_id",
              as: "status",
              pipeline: [{ $project: { name: 1 } }],
            },
          },
          {
            $unwind: "$status",
          },
          {
            $match: queryObj,
          },
          {
            $project: {
              contact_number: 1,
              title: 1,
              status: "$status.name",
              due_time: 1,
              due_date: 1,
              createdAt: 1,
              internal_info: 1,
              assigned_by_first_name: "$assign_by.first_name",
              assigned_by_last_name: "$assign_by.last_name",
              assigned_to_first_name: "$team_Data.first_name",
              assigned_to_last_name: "$team_Data.last_name",
              assigned_to_name: "$team_Data.assigned_to_name",
              assigned_by_name: "$assign_by.assigned_by_name",
              client_name: "$client_Data.client_name",
              column_id: "$status.name",
            },
          },
        ];
        const activity = await Activity.aggregate(taskPipeline)
          .sort(pagination.sort)
          .skip(pagination.skip)
          .limit(pagination.result_per_page);

        const totalAgreementsCount = await Activity.aggregate(taskPipeline);

        // Calculating total pages
        const pages = Math.ceil(
          totalAgreementsCount.length / pagination.result_per_page
        );

        return {
          activity,
          page_count: pages,
        };
      } catch (error) {
        logger.error(`Error while fetch list : ${error}`);
        return throwError(error?.message, error?.statusCode);
      }
    }
  };

  clientTaskList = async (searchObj, user) => {
    if (!searchObj.pagination) {
      try {
        const queryObj = {
          is_deleted: false,
          client_id: user.reference_id,
        };
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
            {
              "client_Data.client_name": {
                $regex: searchObj.search,
                $options: "i",
              },
            },
            {
              "assign_by.first_name": {
                $regex: searchObj.search.toLowerCase(),
                $options: "i",
              },
            },
            {
              "team_Data.first_name": {
                $regex: searchObj.search.toLowerCase(),
                $options: "i",
              },
            },
            {
              "team_Data.last_name": {
                $regex: searchObj.search.toLowerCase(),
                $options: "i",
              },
            },
            {
              "assign_by.last_name": {
                $regex: searchObj.search.toLowerCase(),
                $options: "i",
              },
            },
            {
              "assign_by.assigned_by_name": {
                $regex: searchObj.search.toLowerCase(),
                $options: "i",
              },
            },
            {
              "team_Data.assigned_to_name": {
                $regex: searchObj.search,
                $options: "i",
              },
            },
            // {
            //   assigned_by_name: {
            //     $regex: searchObj.search,
            //     $options: "i",
            //   },
            // },
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
            $match: queryObj,
          },
          {
            $lookup: {
              from: "authentications",
              localField: "client_id",
              foreignField: "reference_id",
              as: "client_Data",
              pipeline: [
                {
                  $project: {
                    name: 1,
                    first_name: 1,
                    last_name: 1,
                    client_name: {
                      $concat: ["$first_name", " ", "$last_name"],
                    },
                  },
                },
              ],
            },
          },
          {
            $unwind: "$client_Data",
          },
          {
            $lookup: {
              from: "authentications",
              localField: "assign_to",
              foreignField: "reference_id",
              as: "team_Data",
              pipeline: [
                {
                  $project: {
                    name: 1,
                    first_name: 1,
                    last_name: 1,
                    assigned_to_name: {
                      $concat: ["$first_name", " ", "$last_name"],
                    },
                  },
                },
              ],
            },
          },
          {
            $unwind: "$team_Data",
          },
          {
            $lookup: {
              from: "authentications",
              localField: "assign_by",
              foreignField: "_id",
              as: "assign_by",
              pipeline: [
                {
                  $project: {
                    name: 1,
                    first_name: 1,
                    last_name: 1,
                    assigned_by_name: {
                      $concat: ["$first_name", " ", "$last_name"],
                    },
                  },
                },
              ],
            },
          },
          {
            $unwind: "$assign_by",
          },
          {
            $lookup: {
              from: "activity_status_masters",
              localField: "activity_status",
              foreignField: "_id",
              as: "status",
              pipeline: [{ $project: { name: 1 } }],
            },
          },
          {
            $unwind: "$status",
          },

          {
            $project: {
              title: 1,
              client_id: 1,
              status: "$status.name",
              due_time: 1,
              due_date: 1,
              createdAt: 1,
              client_name: "$client_Data.name",

              internal_info: 1,
              assigned_by_first_name: "$assign_by.first_name",
              assigned_by_last_name: "$assign_by.last_name",
              assigned_to_first_name: "$team_Data.first_name",
              assigned_to_last_name: "$team_Data.last_name",
              assigned_to_name: "$team_Data.assigned_to_name",
              assigned_by_name: "$assign_by.assigned_by_name",
              client_name: "$client_Data.client_name",

              column_id: "$status.name",
            },
          },
        ];
        const activity = await Activity.aggregate(taskPipeline).sort({
          createdAt: -1,
        });
        // .skip(pagination.skip)
        // .limit(pagination.result_per_page);

        const totalAgreementsCount = await Activity.countDocuments(queryObj);

        // Calculating total pages
        const pages = Math.ceil(
          totalAgreementsCount / pagination.result_per_page
        );

        return {
          activity,
          // page_count: pages,
        };
      } catch (error) {
        logger.error(`Error while fetch list : ${error}`);
        return throwError(error?.message, error?.statusCode);
      }
    } else {
      try {
        const queryObj = {
          is_deleted: false,
          client_id: user.reference_id,
        };
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
            {
              "client_Data.first_name": {
                $regex: searchObj.search.toLowerCase(),
                $options: "i",
              },
            },
            {
              "client_Data.last_name": {
                $regex: searchObj.search.toLowerCase(),
                $options: "i",
              },
            },
            {
              "assign_by.first_name": {
                $regex: searchObj.search.toLowerCase(),
                $options: "i",
              },
            },
            {
              "team_Data.first_name": {
                $regex: searchObj.search.toLowerCase(),
                $options: "i",
              },
            },
            {
              "team_Data.last_name": {
                $regex: searchObj.search.toLowerCase(),
                $options: "i",
              },
            },
            {
              "assign_by.last_name": {
                $regex: searchObj.search.toLowerCase(),
                $options: "i",
              },
            },
            {
              "assign_by.assigned_by_name": {
                $regex: searchObj.search.toLowerCase(),
                $options: "i",
              },
            },
            {
              "team_Data.assigned_to_name": {
                $regex: searchObj.search,
                $options: "i",
              },
            },
            {
              "client_Data.client_name": {
                $regex: searchObj.search,
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
            $match: queryObj,
          },
          {
            $lookup: {
              from: "authentications",
              localField: "client_id",
              foreignField: "reference_id",
              as: "client_Data",
              pipeline: [
                {
                  $project: {
                    name: 1,
                    first_name: 1,
                    last_name: 1,
                    client_name: {
                      $concat: ["$first_name", " ", "$last_name"],
                    },
                  },
                },
              ],
            },
          },
          {
            $unwind: "$client_Data",
          },
          {
            $lookup: {
              from: "authentications",
              localField: "assign_to",
              foreignField: "reference_id",
              as: "team_Data",
              pipeline: [
                {
                  $project: {
                    name: 1,
                    first_name: 1,
                    last_name: 1,
                    assigned_to_name: {
                      $concat: ["$first_name", " ", "$last_name"],
                    },
                  },
                },
              ],
            },
          },
          {
            $unwind: "$team_Data",
          },
          {
            $lookup: {
              from: "authentications",
              localField: "assign_by",
              foreignField: "_id",
              as: "assign_by",
              pipeline: [
                {
                  $project: {
                    name: 1,
                    first_name: 1,
                    last_name: 1,
                    assigned_by_name: {
                      $concat: ["$first_name", " ", "$last_name"],
                    },
                  },
                },
              ],
            },
          },
          {
            $unwind: "$assign_by",
          },
          {
            $lookup: {
              from: "activity_status_masters",
              localField: "activity_status",
              foreignField: "_id",
              as: "status",
              pipeline: [{ $project: { name: 1 } }],
            },
          },
          {
            $unwind: "$status",
          },

          {
            $project: {
              title: 1,
              client_id: 1,
              status: "$status.name",
              due_time: 1,
              due_date: 1,
              createdAt: 1,
              internal_info: 1,
              assigned_by_first_name: "$assign_by.first_name",
              assigned_by_last_name: "$assign_by.last_name",
              assigned_to_first_name: "$team_Data.first_name",
              assigned_to_last_name: "$team_Data.last_name",
              assigned_to_name: "$team_Data.assigned_to_name",
              assigned_by_name: "$assign_by.assigned_by_name",
              client_name: "$client_Data.client_name",

              column_id: "$status.name",
            },
          },
        ];
        const activity = await Activity.aggregate(taskPipeline)
          .sort(pagination.sort)
          .skip(pagination.skip)
          .limit(pagination.result_per_page);

        const totalAgreementsCount = await Activity.aggregate(taskPipeline);

        // Calculating total pages
        const pages = Math.ceil(
          totalAgreementsCount.length / pagination.result_per_page
        );

        return {
          activity,
          page_count: pages,
        };
      } catch (error) {
        logger.error(`Error while fetch list : ${error}`);
        return throwError(error?.message, error?.statusCode);
      }
    }
  };

  teamAdminTaskList = async (searchObj, user) => {
    if (!searchObj.pagination) {
      try {
        const teamRole = await Team_Agency.findOne({
          _id: user.reference_id,
        }).populate("role");

        if (teamRole?.role?.name === "admin") {
          const queryObj = {
            is_deleted: false,
            assign_by: user.reference_id,
          };
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
              {
                "client_Data.first_name": {
                  $regex: searchObj.search.toLowerCase(),
                  $options: "i",
                },
              },
              {
                "client_Data.last_name": {
                  $regex: searchObj.search.toLowerCase(),
                  $options: "i",
                },
              },
              {
                "assign_by.first_name": {
                  $regex: searchObj.search.toLowerCase(),
                  $options: "i",
                },
              },
              {
                "team_Data.first_name": {
                  $regex: searchObj.search.toLowerCase(),
                  $options: "i",
                },
              },
              {
                "team_by.last_name": {
                  $regex: searchObj.search.toLowerCase(),
                  $options: "i",
                },
              },
              {
                "team_by.last_name": {
                  $regex: searchObj.search.toLowerCase(),
                  $options: "i",
                },
              },
              {
                "assign_by.assigned_by_name": {
                  $regex: searchObj.search.toLowerCase(),
                  $options: "i",
                },
              },
              {
                "team_Data.assigned_to_name": {
                  $regex: searchObj.search,
                  $options: "i",
                },
              },
              {
                "client_Data.client_name": {
                  $regex: searchObj.search,
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
              $match: queryObj,
            },
            {
              $lookup: {
                from: "authentications",
                localField: "client_id",
                foreignField: "reference_id",
                as: "client_Data",
                pipeline: [
                  {
                    $project: {
                      name: 1,
                      first_name: 1,
                      last_name: 1,
                      client_name: {
                        $concat: ["$first_name", " ", "$last_name"],
                      },
                    },
                  },
                ],
              },
            },
            {
              $unwind: "$client_Data",
            },
            {
              $lookup: {
                from: "authentications",
                localField: "assign_to",
                foreignField: "reference_id",
                as: "team_Data",
                pipeline: [
                  {
                    $project: {
                      name: 1,
                      first_name: 1,
                      last_name: 1,
                      assigned_to_name: {
                        $concat: ["$first_name", " ", "$last_name"],
                      },
                    },
                  },
                ],
              },
            },
            {
              $unwind: "$team_Data",
            },
            {
              $lookup: {
                from: "authentications",
                localField: "assign_by",
                foreignField: "_id",
                as: "team_by",
                pipeline: [
                  {
                    $project: {
                      name: 1,
                      first_name: 1,
                      last_name: 1,
                      assigned_by_name: {
                        $concat: ["$first_name", " ", "$last_name"],
                      },
                    },
                  },
                ],
              },
            },
            {
              $unwind: "$team_by",
            },
            {
              $lookup: {
                from: "activity_status_masters",
                localField: "activity_status",
                foreignField: "_id",
                as: "status",
                pipeline: [{ $project: { name: 1 } }],
              },
            },
            {
              $unwind: "$status",
            },

            {
              $project: {
                contact_number: 1,
                title: 1,
                client_id: 1,
                status: "$status.name",
                due_time: 1,
                due_date: 1,
                createdAt: 1,
                client_name: "$client_Data.name",

                internal_info: 1,
                assigned_by_first_name: "$assign_by.first_name",
                assigned_by_last_name: "$assign_by.last_name",
                assigned_to_first_name: "$team_Data.first_name",
                assigned_to_last_name: "$team_Data.last_name",
                assigned_to_name: "$team_Data.assigned_to_name",
                assigned_by_name: "$assign_by.assigned_by_name",
                client_name: "$client_Data.client_name",
                assign_by: 1,

                column_id: "$status.name",
              },
            },
          ];
          const activity = await Activity.aggregate(taskPipeline).sort({
            createdAt: -1,
          });
          // .sort(pagination.sort)
          // .skip(pagination.skip)
          // .limit(pagination.result_per_page);

          const totalAgreementsCount = await Activity.countDocuments(queryObj);

          // Calculating total pages
          const pages = Math.ceil(
            totalAgreementsCount / pagination.result_per_page
          );

          return {
            activity,
          };
        } else if (teamRole.role.name === "team_member") {
          const queryObj = {
            is_deleted: false,
            assign_to: user.reference_id,
          };
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
              {
                "client_Data.first_name": {
                  $regex: searchObj.search.toLowerCase(),
                  $options: "i",
                },
              },
              {
                "client_Data.last_name": {
                  $regex: searchObj.search.toLowerCase(),
                  $options: "i",
                },
              },
              {
                "assign_by.first_name": {
                  $regex: searchObj.search.toLowerCase(),
                  $options: "i",
                },
              },
              {
                "team_Data.first_name": {
                  $regex: searchObj.search.toLowerCase(),
                  $options: "i",
                },
              },
              {
                "team_Data.last_name": {
                  $regex: searchObj.search.toLowerCase(),
                  $options: "i",
                },
              },
              {
                "assign_by.last_name": {
                  $regex: searchObj.search.toLowerCase(),
                  $options: "i",
                },
              },
              {
                "assign_by.assigned_by_name": {
                  $regex: searchObj.search.toLowerCase(),
                  $options: "i",
                },
              },
              {
                "team_Data.assigned_to_name": {
                  $regex: searchObj.search,
                  $options: "i",
                },
              },
              {
                "client_Data.client_name": {
                  $regex: searchObj.search,
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
              $match: queryObj,
            },
            {
              $lookup: {
                from: "authentications",
                localField: "client_id",
                foreignField: "reference_id",
                as: "client_Data",
                pipeline: [
                  {
                    $project: {
                      name: 1,
                      first_name: 1,
                      last_name: 1,
                      client_name: {
                        $concat: ["$first_name", " ", "$last_name"],
                      },
                    },
                  },
                ],
              },
            },
            {
              $unwind: "$client_Data",
            },
            {
              $lookup: {
                from: "authentications",
                localField: "assign_to",
                foreignField: "reference_id",
                as: "team_Data",
                pipeline: [
                  {
                    $project: {
                      name: 1,
                      first_name: 1,
                      last_name: 1,
                      assigned_to_name: {
                        $concat: ["$first_name", " ", "$last_name"],
                      },
                    },
                  },
                ],
              },
            },
            {
              $unwind: "$team_Data",
            },
            {
              $lookup: {
                from: "authentications",
                localField: "assign_by",
                foreignField: "_id",
                as: "team_by",
                pipeline: [
                  {
                    $project: {
                      name: 1,
                      first_name: 1,
                      last_name: 1,
                      assigned_to_name: {
                        $concat: ["$first_name", " ", "$last_name"],
                      },
                    },
                  },
                ],
              },
            },
            {
              $unwind: "$team_by",
            },
            {
              $lookup: {
                from: "activity_status_masters",
                localField: "activity_status",
                foreignField: "_id",
                as: "status",
                pipeline: [{ $project: { name: 1 } }],
              },
            },
            {
              $unwind: "$status",
            },

            {
              $project: {
                contact_number: 1,
                title: 1,
                client_id: 1,
                status: "$status.name",
                due_time: 1,
                due_date: 1,
                createdAt: 1,

                internal_info: 1,

                assign_by: 1,
                assigned_by_first_name: "$assign_by.first_name",
                assigned_by_last_name: "$assign_by.last_name",
                assigned_to_first_name: "$team_Data.first_name",
                assigned_to_last_name: "$team_Data.last_name",
                assigned_to_name: "$team_Data.assigned_to_name",
                assigned_by_name: "$assign_by.assigned_by_name",
                client_name: "$client_Data.client_name",

                column_id: "$status.name",
              },
            },
          ];
          const activity = await Activity.aggregate(taskPipeline).sort({
            createdAt: -1,
          });
          // .sort(pagination.sort)
          // .skip(pagination.skip)
          // .limit(pagination.result_per_page);

          const totalAgreementsCount = await Activity.countDocuments(queryObj);

          // Calculating total pages
          const pages = Math.ceil(
            totalAgreementsCount / pagination.result_per_page
          );

          return {
            activity,
            // page_count: pages,
          };
        }
      } catch (error) {
        logger.error(`Error while fetch list : ${error}`);
        return throwError(error?.message, error?.statusCode);
      }
    } else {
      try {
        const teamRole = await Team_Agency.findOne({
          _id: user.reference_id,
        }).populate("role");

        if (teamRole?.role?.name === "admin") {
          const queryObj = {
            $or: [
              { assign_by: user.reference_id },
              { assign_to: user.reference_id },
            ],
            is_deleted: false,
          };
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
              {
                "client_Data.first_name": {
                  $regex: searchObj.search.toLowerCase(),
                  $options: "i",
                },
              },
              {
                "client_Data.last_name": {
                  $regex: searchObj.search.toLowerCase(),
                  $options: "i",
                },
              },
              {
                "assign_by.first_name": {
                  $regex: searchObj.search.toLowerCase(),
                  $options: "i",
                },
              },
              {
                "team_Data.first_name": {
                  $regex: searchObj.search.toLowerCase(),
                  $options: "i",
                },
              },
              {
                "team_by.last_name": {
                  $regex: searchObj.search.toLowerCase(),
                  $options: "i",
                },
              },
              {
                "team_by.last_name": {
                  $regex: searchObj.search.toLowerCase(),
                  $options: "i",
                },
              },
              {
                "assign_by.assigned_by_name": {
                  $regex: searchObj.search.toLowerCase(),
                  $options: "i",
                },
              },
              {
                "team_Data.assigned_to_name": {
                  $regex: searchObj.search,
                  $options: "i",
                },
              },
              {
                "client_Data.client_name": {
                  $regex: searchObj.search,
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
              $match: queryObj,
            },
            {
              $lookup: {
                from: "authentications",
                localField: "client_id",
                foreignField: "reference_id",
                as: "client_Data",
                pipeline: [
                  {
                    $project: {
                      name: 1,
                      first_name: 1,
                      last_name: 1,
                      client_name: {
                        $concat: ["$first_name", " ", "$last_name"],
                      },
                    },
                  },
                ],
              },
            },
            {
              $unwind: "$client_Data",
            },
            {
              $lookup: {
                from: "authentications",
                localField: "assign_to",
                foreignField: "reference_id",
                as: "team_Data",
                pipeline: [
                  {
                    $project: {
                      name: 1,
                      first_name: 1,
                      last_name: 1,
                      assigned_to_name: {
                        $concat: ["$first_name", " ", "$last_name"],
                      },
                    },
                  },
                ],
              },
            },
            {
              $unwind: "$team_Data",
            },
            {
              $lookup: {
                from: "authentications",
                localField: "assign_by",
                foreignField: "_id",
                as: "team_by",
                pipeline: [
                  {
                    $project: {
                      name: 1,
                      first_name: 1,
                      last_name: 1,
                      assigned_by_name: {
                        $concat: ["$first_name", " ", "$last_name"],
                      },
                    },
                  },
                ],
              },
            },
            {
              $unwind: "$team_by",
            },
            {
              $lookup: {
                from: "activity_status_masters",
                localField: "activity_status",
                foreignField: "_id",
                as: "status",
                pipeline: [{ $project: { name: 1 } }],
              },
            },
            {
              $unwind: "$status",
            },

            {
              $project: {
                contact_number: 1,
                title: 1,
                client_id: 1,
                status: "$status.name",
                due_time: 1,
                due_date: 1,
                createdAt: 1,
                client_name: "$client_Data.name",
                internal_info: 1,
                assigned_by_first_name: "$assign_by.first_name",
                assigned_by_last_name: "$assign_by.last_name",
                assigned_to_first_name: "$team_Data.first_name",
                assigned_to_last_name: "$team_Data.last_name",
                assigned_to_name: "$team_Data.assigned_to_name",
                assigned_by_name: "$assign_by.assigned_by_name",
                client_name: "$client_Data.client_name",
                assign_by: 1,
                column_id: "$status.name",
              },
            },
          ];
          const activity = await Activity.aggregate(taskPipeline)
            .sort(pagination.sort)
            .skip(pagination.skip)
            .limit(pagination.result_per_page);
          const totalAgreementsCount = await Activity.aggregate(taskPipeline);

          // Calculating total pages
          const pages = Math.ceil(
            totalAgreementsCount.length / pagination.result_per_page
          );

          return {
            activity,
            page_count: pages,
            team_member_role: teamRole?.role?.name,
          };
        } else if (teamRole.role.name === "team_member") {
          const queryObj = {
            is_deleted: false,
            assign_to: user.reference_id,
          };
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
              {
                "client_Data.first_name": {
                  $regex: searchObj.search.toLowerCase(),
                  $options: "i",
                },
              },
              {
                "client_Data.last_name": {
                  $regex: searchObj.search.toLowerCase(),
                  $options: "i",
                },
              },
              {
                "assign_by.first_name": {
                  $regex: searchObj.search.toLowerCase(),
                  $options: "i",
                },
              },
              {
                "team_Data.first_name": {
                  $regex: searchObj.search.toLowerCase(),
                  $options: "i",
                },
              },
              {
                "team_Data.last_name": {
                  $regex: searchObj.search.toLowerCase(),
                  $options: "i",
                },
              },
              {
                "assign_by.last_name": {
                  $regex: searchObj.search.toLowerCase(),
                  $options: "i",
                },
              },
              {
                "assign_by.assigned_by_name": {
                  $regex: searchObj.search.toLowerCase(),
                  $options: "i",
                },
              },
              {
                "team_Data.assigned_to_name": {
                  $regex: searchObj.search,
                  $options: "i",
                },
              },
              {
                "client_Data.client_name": {
                  $regex: searchObj.search,
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
              $match: queryObj,
            },
            {
              $lookup: {
                from: "authentications",
                localField: "client_id",
                foreignField: "reference_id",
                as: "client_Data",
                pipeline: [
                  {
                    $project: {
                      name: 1,
                      first_name: 1,
                      last_name: 1,
                      client_name: {
                        $concat: ["$first_name", " ", "$last_name"],
                      },
                    },
                  },
                ],
              },
            },
            {
              $unwind: "$client_Data",
            },
            {
              $lookup: {
                from: "authentications",
                localField: "assign_to",
                foreignField: "reference_id",
                as: "team_Data",
                pipeline: [
                  {
                    $project: {
                      name: 1,
                      first_name: 1,
                      last_name: 1,
                      assigned_to_name: {
                        $concat: ["$first_name", " ", "$last_name"],
                      },
                    },
                  },
                ],
              },
            },
            {
              $unwind: "$team_Data",
            },
            {
              $lookup: {
                from: "authentications",
                localField: "assign_by",
                foreignField: "_id",
                as: "team_by",
                pipeline: [
                  {
                    $project: {
                      name: 1,
                      first_name: 1,
                      last_name: 1,
                      assigned_by_name: {
                        $concat: ["$first_name", " ", "$last_name"],
                      },
                    },
                  },
                ],
              },
            },
            {
              $unwind: "$team_by",
            },
            {
              $lookup: {
                from: "activity_status_masters",
                localField: "activity_status",
                foreignField: "_id",
                as: "status",
                pipeline: [{ $project: { name: 1 } }],
              },
            },
            {
              $unwind: "$status",
            },

            {
              $project: {
                contact_number: 1,
                title: 1,
                client_id: 1,
                status: "$status.name",
                due_time: 1,
                due_date: 1,
                createdAt: 1,

                internal_info: 1,

                assign_by: 1,
                assigned_by_first_name: "$assign_by.first_name",
                assigned_by_last_name: "$assign_by.last_name",
                assigned_to_first_name: "$team_Data.first_name",
                assigned_to_last_name: "$team_Data.last_name",
                assigned_to_name: "$team_Data.assigned_to_name",
                assigned_by_name: "$assign_by.assigned_by_name",
                client_name: "$client_Data.client_name",

                column_id: "$status.name",
              },
            },
          ];
          const activity = await Activity.aggregate(taskPipeline)
            .sort(pagination.sort)
            .skip(pagination.skip)
            .limit(pagination.result_per_page);
          const totalAgreementsCount = await Activity.aggregate(taskPipeline);

          // Calculating total pages
          const pages = Math.ceil(
            totalAgreementsCount.length / pagination.result_per_page
          );

          return {
            activity,
            page_count: pages,
            team_member_role: teamRole?.role?.name,
          };
        }
      } catch (error) {
        logger.error(`Error while fetch list : ${error}`);
        return throwError(error?.message, error?.statusCode);
      }
    }
  };

  getTaskById = async (id) => {
    try {
      const taskPipeline = [
        {
          $lookup: {
            from: "authentications",
            localField: "client_id",
            foreignField: "reference_id",
            as: "client_Data",
            pipeline: [{ $project: { name: 1, first_name: 1, last_name: 1 } }],
          },
        },
        {
          $unwind: "$client_Data",
        },
        {
          $lookup: {
            from: "authentications",
            localField: "assign_to",
            foreignField: "reference_id",
            as: "team_Data",
            pipeline: [{ $project: { name: 1, first_name: 1, last_name: 1 } }],
          },
        },
        {
          $unwind: "$team_Data",
        },
        {
          $lookup: {
            from: "authentications",
            localField: "assign_by",
            foreignField: "_id",
            as: "assign_by",
            pipeline: [{ $project: { name: 1, first_name: 1, last_name: 1 } }],
          },
        },
        {
          $unwind: "$assign_by",
        },
        {
          $lookup: {
            from: "activity_status_masters",
            localField: "activity_status",
            foreignField: "_id",
            as: "status",
            pipeline: [{ $project: { name: 1 } }],
          },
        },
        {
          $unwind: "$status",
        },
        {
          $match: {
            _id: new mongoose.Types.ObjectId(id),
            is_deleted: false,
          },
        },
        {
          $project: {
            title: 1,
            due_time: 1,
            due_date: 1,
            createdAt: 1,
            status: "$status.name",
            client_id: 1,
            client_name: "$client_Data.name",
            client_first_name: "$client_Data.first_name",
            client_last_name: "$client_Data.last_name",
            internal_info: 1,
            client_fullName: {
              $concat: [
                "$client_Data.first_name",
                " ",
                "$client_Data.last_name",
              ],
            },
            assign_to: 1,
            assigned_to_name: "$team_Data.name",
            assigned_to_first_name: "$team_Data.first_name",
            assigned_to_last_name: "$team_Data.last_name",
            assigned_by_name: "$assign_by.name",
            assigned_by_first_name: "$assign_by.first_name",
            assigned_by_last_name: "$assign_by.last_name",
            assigned_by_name: {
              $concat: ["$assign_by.first_name", " ", "$assign_by.last_name"],
            },
            assign_to_name: {
              $concat: ["$team_Data.first_name", " ", "$team_Data.last_name"],
            },
          },
        },
      ];
      const activity = await Activity.aggregate(taskPipeline);

      return activity;
    } catch (error) {
      logger.error(`Error while fetching data: ${error}`);
      return throwError(error?.message, error?.statusCode);
    }
  };

  deleteTask = async (payload) => {
    const { taskIdsToDelete } = payload;
    try {
      const deletedTask = await Activity.updateMany(
        { _id: { $in: taskIdsToDelete } },
        { $set: { is_deleted: true } }
      );
      return deletedTask;
    } catch (error) {
      logger.error(`Error while Deleting task, ${error}`);
      throwError(error?.message, error?.statusCode);
    }
  };

  updateTask = async (payload, id) => {
    try {
      const {
        title,
        internal_info,
        due_date,
        assign_to,
        client_id,
        mark_as_done,
      } = payload;

      const dueDateObject = moment(due_date);
      const duetimeObject = moment(due_date);

      const timeOnly = duetimeObject.format("HH:mm:ss");

      const currentDate = moment().startOf("day");

      if (dueDateObject.isSameOrBefore(currentDate)) {
        return throwError(returnMessage("activity", "dateinvalid"));
      }
      let status;
      if (mark_as_done === true) {
        status = await ActivityStatus.findOne({ name: "completed" }).lean();
      } else {
        status = await ActivityStatus.findOne({ name: "pending" }).lean();
      }

      const updateTasks = await Activity.findByIdAndUpdate(
        {
          _id: id,
        },
        {
          title,
          internal_info,
          due_date: dueDateObject.toDate(),
          due_time: timeOnly,
          assign_to,
          client_id,
          activity_status: status._id,
        },
        { new: true, useFindAndModify: false }
      );
      return updateTasks;
    } catch (error) {
      logger.error(`Error while Updating task, ${error}`);
      throwError(error?.message, error?.statusCode);
    }
  };

  statusUpdate = async (payload, id) => {
    try {
      const { status } = payload;
      let update_status;
      if (status === "completed") {
        update_status = await ActivityStatus.findOne({
          name: "completed",
        }).lean();
      } else if (status === "pending") {
        update_status = await ActivityStatus.findOne({
          name: "pending",
        }).lean();
      } else if (status === "in_progress") {
        update_status = await ActivityStatus.findOne({
          name: "in_progress",
        }).lean();
      } else if (status === "overdue") {
        update_status = await ActivityStatus.findOne({
          name: "overdue",
        }).lean();
      } else if (status === "cancel") {
        update_status = await ActivityStatus.findOne({
          name: "cancel",
        }).lean();
      }

      const updateTasks = await Activity.findByIdAndUpdate(
        {
          _id: id,
        },
        {
          activity_status: update_status._id,
        },
        { new: true, useFindAndModify: false }
      );
      return updateTasks;
    } catch (error) {
      logger.error(`Error while Updating status, ${error}`);
      throwError(error?.message, error?.statusCode);
    }
  };

  // this function is used to create the call meeting and other call details
  createCallMeeting = async (payload, user) => {
    try {
      if (user?.role?.name === "client" || user?.role?.name === "team_client")
        return throwError(
          returnMessage("auth", "unAuthorized"),
          statusCode.forbidden
        );

      validateRequestFields(payload, [
        "title",
        "agenda",
        "client_id",
        "due_date",
        "assign_to",
        "activity_type",
        "meeting_start_time",
        "meeting_end_time",
      ]);

      const {
        client_id,
        assign_to,
        title,
        agenda,
        due_date,
        meeting_start_time,
        meeting_end_time,
        activity_type,
        internal_info,
      } = payload;

      let recurring_date;
      const current_date = moment.utc().startOf("day");
      const start_date = moment.utc(due_date).startOf("day");
      const start_time = moment(meeting_start_time, "HH:mm a");
      const end_time = moment(meeting_end_time, "HH:mm a");
      if (!start_date.isSameOrAfter(current_date))
        return throwError(returnMessage("activity", "dateinvalid"));

      if (!end_time.isAfter(start_time))
        return throwError(returnMessage("activity", "invalidTime"));

      if (activity_type === "others" && !payload?.recurring_end_date)
        return throwError(returnMessage("activity", "recurringDateRequired"));

      if (activity_type === "others" && payload?.recurring_end_date) {
        recurring_date = moment.utc(payload?.recurring_end_date).endOf("day");
        if (!recurring_date.isSameOrAfter(start_date))
          return throwError(returnMessage("activity", "invalidRecurringDate"));
      }

      const [activity_type_id, activity_status_type] = await Promise.all([
        ActivityType.findOne({
          name: activity_type,
        })
          .select("_id")
          .lean(),
        ActivityStatus.findOne({ name: "pending" }).select("name").lean(),
      ]);

      if (!activity_type_id)
        return throwError(
          returnMessage("activity", "activityTypeNotFound"),
          statusCode.notFound
        );

      // check for the user role. if the role is team_agency then we need to
      // find the agency id for that user which he is assigned

      // let team_agency_detail;
      if (user?.role?.name === "team_agency") {
        const team_agency_detail = await Team_Agency.findById(
          user?.reference_id
        ).lean();
        user.agency_id = team_agency_detail?.agency_id;
      }

      // this below function is used to check weather client is assign to any type of the call or other
      // activity or not if yes then throw an error but it should be in the same agency id not in the other
      let meeting_exist;
      if (user?.role?.name === "agency" && !mark_as_done) {
        meeting_exist = await Activity.findOne({
          client_id,
          agency_id: user?.reference_id,
          due_date: start_date,
          activity_status: { $ne: activity_status_type?._id },
          $or: [
            {
              $and: [
                { meeting_start_time: { $gt: start_time } },
                { meeting_end_time: { $lt: end_time } },
              ],
            },
            {
              $and: [
                { due_date: { $gt: start_date } },
                { recurring_end_date: { $lt: recurring_date } },
              ],
            },
          ],
          activity_type: activity_type_id?._id,
        }).lean();
      } else if (user?.role?.name === "team_agency" && !mark_as_done) {
        meeting_exist = await Activity.findOne({
          client_id,
          agency_id: user?.agency_id,
          activity_status: { $ne: activity_status_type?._id },
          due_date: start_date,
          $or: [
            {
              $and: [
                { meeting_start_time: { $gt: start_time } },
                { meeting_end_time: { $lt: end_time } },
              ],
            },
            {
              $and: [
                { due_date: { $gt: start_date } },
                { recurring_end_date: { $lt: recurring_date } },
              ],
            },
          ],
          activity_type: activity_type_id?._id,
        }).lean();
      }
      if (meeting_exist)
        return throwError(
          returnMessage("activity", "meetingScheduledForClient")
        );

      // if the user role is agency then we need to check weather team member is assined to other call or not

      if (user?.role?.name === "agency" && !mark_as_done) {
        const meeting_exist = await Activity.findOne({
          assign_to,
          agency_id: user?.reference_id,
          due_date: start_date,
          activity_status: { $ne: activity_status_type?._id },
          $or: [
            {
              $and: [
                { meeting_start_time: { $gt: start_time } },
                { meeting_end_time: { $lt: end_time } },
              ],
            },
            {
              $and: [
                { due_date: { $gt: start_date } },
                { recurring_end_date: { $lt: recurring_date } },
              ],
            },
          ],
          activity_type: activity_type_id?._id,
        }).lean();

        if (meeting_exist)
          return throwError(
            returnMessage("activity", "meetingScheduledForTeam")
          );
      } else if (user?.role?.name === "team_agency" && !mark_as_done) {
        const meeting_exist = await Activity.findOne({
          assign_to,
          agency_id: user?.agency_id,
          due_date: start_date,
          activity_status: { $ne: activity_status_type?._id },
          $or: [
            {
              $and: [
                { meeting_start_time: { $gt: start_time } },
                { meeting_end_time: { $lt: end_time } },
              ],
            },
            {
              $and: [
                { due_date: { $gt: start_date } },
                { recurring_end_date: { $lt: recurring_date } },
              ],
            },
          ],
          activity_type: activity_type_id?._id,
        }).lean();

        if (meeting_exist)
          return throwError(
            returnMessage("activity", "meetingScheduledForTeam")
          );
      }

      let status;
      if (mark_as_done === true) {
        status = await ActivityStatus.findOne({ name: "completed" }).lean();
      } else {
        status = await ActivityStatus.findOne({ name: "pending" }).lean();
      }

      await Activity.create({
        activity_status: status?._id,
        activity_type: activity_type_id?._id,
        agency_id: user?.agency_id || user?.reference_id,
        assign_by: user?.reference_id,
        agenda,
        assign_to,
        title,
        client_id,
        internal_info,
        meeting_start_time: moment(meeting_start_time, "HH:mm a").format(
          "HH:mm a"
        ),
        meeting_end_time: moment(meeting_end_time, "HH:mm a").format("HH:mm a"),
        due_date: start_date,
        recurring_end_date: moment
          .utc(payload?.recurring_end_date)
          .endOf("day"),
      });
      return;
    } catch (error) {
      logger.error(`Error while creating call meeting and other: ${error}`);
      return throwError(error?.message, error?.statusCode);
    }
  };

  // this function is used to fetch the call or other call detials by id
  getActivity = async (activity_id) => {
    try {
      const activity = await Activity.findById(activity_id)
        .populate("activity_type", "name")
        .populate("activity_status", "name")
        .lean();
      if (!activity)
        return throwError(
          returnMessage("activity", "activityNotFound"),
          statusCode.notFound
        );
      return activity;
    } catch (error) {
      logger.error(`Error while Getting the activity, ${error}`);
      return throwError(error?.message, error?.statusCode);
    }
  };

  // this function is used to update the call type activity or other
  updateActivity = async (activity_id, payload, user) => {
    try {
      const activity_exist = await Activity.findById(activity_id).lean();
      if (!activity_exist)
        return throwError(
          returnMessage("activity", "activityNotFound"),
          statusCode.notFound
        );

      if (user?.role?.name === "client" || user?.role?.name === "team_client")
        return throwError(
          returnMessage("auth", "unAuthorized"),
          statusCode.forbidden
        );

      validateRequestFields(payload, [
        "title",
        "agenda",
        "client_id",
        "due_time",
        "due_date",
        "assign_to",
        "activity_type",
      ]);

      const {
        client_id,
        assign_to,
        title,
        agenda,
        due_date,
        meeting_start_time,
        meeting_end_time,
        activity_type,
        internal_info,
      } = payload;

      let recurring_date;
      const current_date = moment.utc().startOf("day");
      const start_date = moment.utc(due_date).startOf("day");
      const start_time = moment(meeting_start_time, "HH:mm a");
      const end_time = moment(meeting_end_time, "HH:mm a");
      if (!start_date.isSameOrAfter(current_date))
        return throwError(returnMessage("activity", "dateinvalid"));

      if (!end_time.isAfter(start_time))
        return throwError(returnMessage("activity", "invalidTime"));

      if (activity_type === "others" && !payload?.recurring_end_date)
        return throwError(returnMessage("activity", "recurringDateRequired"));

      if (activity_type === "others" && payload?.recurring_end_date) {
        recurring_date = moment.utc(payload?.recurring_end_date).endOf("day");
        if (!recurring_date.isSameOrAfter(start_date))
          return throwError(returnMessage("activity", "invalidRecurringDate"));
      }

      const [activity_type_id, activity_status_type] = await Promise.all([
        ActivityType.findOne({
          name: activity_type,
        })
          .select("_id")
          .lean(),
        ActivityStatus.findOne({ name: "pending" }).select("name").lean(),
      ]);

      if (!activity_type_id)
        return throwError(
          returnMessage("activity", "activityTypeNotFound"),
          statusCode.notFound
        );

      // check for the user role. if the role is team_agency then we need to
      // find the agency id for that user which he is assigned

      // let team_agency_detail;
      if (user?.role?.name === "team_agency") {
        const team_agency_detail = await Team_Agency.findById(
          user?.reference_id
        ).lean();
        user.agency_id = team_agency_detail?.agency_id;
      }

      // this below function is used to check weather client is assign to any type of the call or other
      // activity or not if yes then throw an error but it should be in the same agency id not in the other
      let meeting_exist;
      if (user?.role?.name === "agency" && !mark_as_done) {
        meeting_exist = await Activity.findOne({
          client_id,
          agency_id: user?.reference_id,
          due_date: start_date,
          activity_status: { $ne: activity_status_type?._id },
          $or: [
            {
              $and: [
                { meeting_start_time: { $gt: start_time } },
                { meeting_end_time: { $lt: end_time } },
              ],
            },
            {
              $and: [
                { due_date: { $gt: start_date } },
                { recurring_end_date: { $lt: recurring_date } },
              ],
            },
          ],
          activity_type: activity_type_id?._id,
        })
          .where("_id")
          .ne(activity_id)
          .lean();
      } else if (user?.role?.name === "team_agency" && !mark_as_done) {
        meeting_exist = await Activity.findOne({
          client_id,
          agency_id: user?.agency_id,
          activity_status: { $ne: activity_status_type?._id },
          due_date: start_date,
          $or: [
            {
              $and: [
                { meeting_start_time: { $gt: start_time } },
                { meeting_end_time: { $lt: end_time } },
              ],
            },
            {
              $and: [
                { due_date: { $gt: start_date } },
                { recurring_end_date: { $lt: recurring_date } },
              ],
            },
          ],
          activity_type: activity_type_id?._id,
        })
          .where("_id")
          .ne(activity_id)
          .lean();
      }
      if (meeting_exist)
        return throwError(
          returnMessage("activity", "meetingScheduledForClient")
        );

      // if the user role is agency then we need to check weather team member is assined to other call or not

      if (user?.role?.name === "agency" && !mark_as_done) {
        const meeting_exist = await Activity.findOne({
          assign_to,
          agency_id: user?.reference_id,
          due_date: start_date,
          activity_status: { $ne: activity_status_type?._id },
          $or: [
            {
              $and: [
                { meeting_start_time: { $gt: start_time } },
                { meeting_end_time: { $lt: end_time } },
              ],
            },
            {
              $and: [
                { due_date: { $gt: start_date } },
                { recurring_end_date: { $lt: recurring_date } },
              ],
            },
          ],
          activity_type: activity_type_id?._id,
        })
          .where("_id")
          .ne(activity_id)
          .lean();

        if (meeting_exist)
          return throwError(
            returnMessage("activity", "meetingScheduledForTeam")
          );
      } else if (user?.role?.name === "team_agency" && !mark_as_done) {
        const meeting_exist = await Activity.findOne({
          assign_to,
          agency_id: user?.agency_id,
          due_date: start_date,
          activity_status: { $ne: activity_status_type?._id },
          $or: [
            {
              $and: [
                { meeting_start_time: { $gt: start_time } },
                { meeting_end_time: { $lt: end_time } },
              ],
            },
            {
              $and: [
                { due_date: { $gt: start_date } },
                { recurring_end_date: { $lt: recurring_date } },
              ],
            },
          ],
          activity_type: activity_type_id?._id,
        })
          .where("_id")
          .ne(activity_id)
          .lean();

        if (meeting_exist)
          return throwError(
            returnMessage("activity", "meetingScheduledForTeam")
          );
      }

      let status;
      if (mark_as_done === true) {
        status = await ActivityStatus.findOne({ name: "completed" }).lean();
      } else {
        status = await ActivityStatus.findOne({ name: "pending" }).lean();
      }

      await Activity.findByIdAndUpdate(activity_id, {
        activity_status: status?._id,
        activity_type: activity_type_id?._id,
        agency_id: user?.agency_id || user?.reference_id,
        assign_by: user?.reference_id,
        agenda,
        assign_to,
        title,
        client_id,
        internal_info,
        meeting_start_time: moment(meeting_start_time, "HH:mm a").format(
          "HH:mm a"
        ),
        meeting_end_time: moment(meeting_end_time, "HH:mm a").format("HH:mm a"),
        due_date: start_date,
        recurring_end_date: moment
          .utc(payload?.recurring_end_date)
          .endOf("day"),
      });
      return;
    } catch (error) {
      logger.error(`Error while updating call meeting and other: ${error}`);
      return throwError(error?.message, error?.statusCode);
    }
  };
}

module.exports = ActivityService;
