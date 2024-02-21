const Notification = require("../models/notificationSchema");
const logger = require("../logger");
const { throwError } = require("../helpers/errorUtil");
const {
  returnMessage,
  invoiceTemplate,
  paginationObject,
} = require("../utils/utils");
const { ObjectId } = require("mongodb");
const fs = require("fs");
const Handlebars = require("handlebars");

const statusCode = require("../messages/english.json");
const Authentication = require("../models/authenticationSchema");
const sendEmail = require("../helpers/sendEmail");
const { sendNotification } = require("../socket");

class NotificationService {
  // Get Client list  ------   AGENCY API
  addNotification = async (payload, activity_id, activity_data, res) => {
    try {
      const { client_id, assign_to, assign_by } = payload;
      let message = `A new meeting has been scheduled and arranged by ${activity_data[0].assigned_by_name}.The meeting is titled "${payload.title}" and is set to take place on ${payload.due_date} from ${payload.meeting_start_time} to ${payload.meeting_end_time}.`;

      if (payload.recurring_end_date) {
        message += `The meeting is part of a recurring schedule, with the last occurrence on ${payload.recurring_end_date}.`;
      }
      sendNotification(client_id, message);
      sendNotification(assign_to, message);

      await Notification.create({
        client_info: {
          _id: client_id,
        },
        assign_to: {
          _id: assign_to,
        },
        assign_by: {
          _id: assign_by,
        },

        data: {
          reference_id: activity_id,
          activity_type: payload?.activity_type,
        },
        message: message,
      });
    } catch (error) {
      logger.error(`Error while fetching agencies: ${error}`);
      return throwError(error?.message, error?.statusCode);
    }
  };

  getNotification = async (user, searchObj) => {
    try {
      const { skip, limit } = searchObj;
      console.log(skip);
      console.log(limit);

      const notifications = await Notification.find(
        {
          $or: [
            { "client_info._id": user.reference_id },
            { "assign_to._id": user.reference_id },
            { "assign_by._id": user.reference_id },
          ],
        },
        {
          _id: 1,
          data: 1,
          message: 1,
          createdAt: 1,
          updatedAt: 1,
        }
      )
        .skip(parseInt(skip))
        .limit(parseInt(limit));

      return notifications;
    } catch (error) {
      logger.error(`Error while fetching agencies: ${error}`);
      return throwError(error?.message, error?.statusCode);
    }
  };
}

module.exports = NotificationService;
