const Notification = require("../models/notificationSchema");
const logger = require("../logger");
const { throwError } = require("../helpers/errorUtil");
const {
  returnMessage,
  invoiceTemplate,
  paginationObject,
  returnNotification,
  replaceFields,
  extractTextFromHtml,
} = require("../utils/utils");
const { ObjectId } = require("mongodb");
const fs = require("fs");
const Handlebars = require("handlebars");

const statusCode = require("../messages/english.json");
const Authentication = require("../models/authenticationSchema");
const sendEmail = require("../helpers/sendEmail");
const { sendNotification, eventEmitter } = require("../socket");

class NotificationService {
  // Get Client list  ------   AGENCY API
  addNotification = async (payload, activity_id) => {
    try {
      console.log(payload);
      // Activity
      if (payload.module_name === "activity") {
        if (payload.activity_type_action === "create_call_meeting") {
          const clientMessage = replaceFields(
            returnNotification(
              "activity",
              "createCallMeeting",
              "clientMessage"
            ),
            {
              ...payload,
              agenda: extractTextFromHtml(payload.agenda),
            }
          );
          const clientNotification = await Notification.create({
            user_id: payload.client_id,
            type: "activity",
            data: activity_id,
            message: clientMessage,
          });
          eventEmitter("NOTIFICATION", clientNotification, payload.client_id);
          const assignToMessage = replaceFields(
            returnNotification(
              "activity",
              "createCallMeeting",
              "assignToMessage"
            ),
            { ...payload, agenda: extractTextFromHtml(payload.agenda) }
          );
          const assignToNotification = await Notification.create({
            user_id: payload.assign_to,
            type: "activity",
            data: activity_id,
            message: assignToMessage,
          });

          eventEmitter("NOTIFICATION", assignToNotification, payload.assign_to);
        }
        if (payload.activity_type_action === "cancel") {
          const clientMessage = replaceFields(
            returnNotification(
              "activity",
              "activityCancelled",
              "clientMessage"
            ),
            {
              ...payload,
              agenda: extractTextFromHtml(payload.agenda),
            }
          );
          const clientNotification = await Notification.create({
            user_id: payload.client_id,
            type: "activity",
            data: activity_id,
            message: clientMessage,
          });
          eventEmitter("NOTIFICATION", clientNotification, payload.client_id);
          const assignToMessage = replaceFields(
            returnNotification(
              "activity",
              "activityCancelled",
              "assignToMessage"
            ),
            { ...payload, agenda: extractTextFromHtml(payload.agenda) }
          );
          const assignToNotification = await Notification.create({
            user_id: payload.assign_to,
            type: "activity",
            data: activity_id,
            message: assignToMessage,
          });

          eventEmitter("NOTIFICATION", assignToNotification, payload.assign_to);
        }
      }

      // Task

      if (payload.module_name === "task") {
        if (payload.activity_type_action === "createTask") {
          const clientMessage = replaceFields(
            returnNotification("activity", "createTask", "clientMessage"),
            {
              ...payload,
            }
          );
          console.log(clientMessage);
          const clientNotification = await Notification.create({
            user_id: payload.client_id,
            type: "task",
            data: activity_id,
            message: clientMessage,
          });
          eventEmitter("NOTIFICATION", clientNotification, payload.client_id);
          const assignToMessage = replaceFields(
            returnNotification("activity", "createTask", "assignToMessage"),
            { ...payload }
          );

          const assignToNotification = await Notification.create({
            user_id: payload.assign_to,
            type: "task",
            data: activity_id,
            message: assignToMessage,
          });
          eventEmitter("NOTIFICATION", assignToNotification, payload.assign_to);
        }
        if (payload.activity_type_action === "cancel") {
          const clientMessage = replaceFields(
            returnNotification("activity", "createTask", "clientMessage"),
            {
              ...payload,
            }
          );
          const clientNotification = await Notification.create({
            user_id: payload.client_id,
            type: "activity",
            data: activity_id,
            message: clientMessage,
          });
          eventEmitter("NOTIFICATION", clientNotification, payload.client_id);
          const assignToMessage = replaceFields(
            returnNotification(
              "activity",
              "activityCancelled",
              "assignToMessage"
            ),
            { ...payload }
          );
          const assignToNotification = await Notification.create({
            user_id: payload.assign_to,
            type: "activity",
            data: activity_id,
            message: assignToMessage,
          });

          eventEmitter("NOTIFICATION", assignToNotification, payload.assign_to);
        }
      }

      return;
    } catch (error) {
      logger.error(`Error while fetching agencies: ${error}`);
      return throwError(error?.message, error?.statusCode);
    }
  };

  getNotification = async (user, searchObj) => {
    try {
      const { skip, limit } = searchObj;

      const notifications = await Notification.find({
        user_id: user.reference_id,
      })
        .sort({ is_read: -1 })
        .skip(skip)
        .limit(limit);
      return notifications;
    } catch (error) {
      logger.error(`Error while fetching agencies: ${error}`);
      return throwError(error?.message, error?.statusCode);
    }
  };

  readNotification = async (payload, user) => {
    try {
      const { notification_id } = payload;
      if (notification_id === "all") {
        await Notification.updateMany(
          {
            user_id: user.reference_id,
          },
          {
            is_read: true,
          },
          { new: true }
        );
      } else {
        await Notification.findOneAndUpdate(
          {
            _id: notification_id,
            user_id: user.reference_id,
          },
          {
            is_read: true,
          },
          { new: true, useFindAndModify: false }
        );
      }

      return;
    } catch (error) {
      logger.error(`Error while fetching agencies: ${error}`);
      return throwError(error?.message, error?.statusCode);
    }
  };
}

module.exports = NotificationService;
