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
  addNotification = async (payload, activity_id, activity_data) => {
    try {
      const { client_id, assign_to, assign_by } = payload;
      let message = `A new meeting has been scheduled and arranged by ${activity_data.assigned_by_name}.The meeting is titled "${payload.title}" and is set to take place on ${payload.due_date} from ${payload.meeting_start_time} to ${payload.meeting_end_time}.`;

      if (payload.recurring_end_date) {
        message += `The meeting is part of a recurring schedule, with the last occurrence on ${payload.recurring_end_date}.`;
      }

      const newNotification = await Notification.create({
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

      sendNotification(client_id, newNotification);
      sendNotification(assign_to, newNotification);
      return;
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

      console.log(user.reference_id);

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

  readNotification = async (payload, user) => {
    try {
      const { notification_id } = payload;
      const notification = await Notification.findOne({
        _id: notification_id,
        $or: [
          { "client_info._id": user.reference_id },
          { "assign_to._id": user.reference_id },
          { "assign_by._id": user.reference_id },
        ],
      });
    } catch (error) {
      logger.error(`Error while fetching agencies: ${error}`);
      return throwError(error?.message, error?.statusCode);
    }
  };
}

module.exports = NotificationService;
