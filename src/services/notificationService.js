const Notification = require("../models/notificationSchema");
const logger = require("../logger");
const { throwError } = require("../helpers/errorUtil");
const {
  returnNotification,
  replaceFields,
  extractTextFromHtml,
} = require("../utils/utils");

const { eventEmitter } = require("../socket");

class NotificationService {
  // Add Notification
  addNotification = async (payload, activity_id) => {
    try {
      console.log(payload);

      const with_unread_count = async (notification_data, user_id) => {
        const un_read_count = await Notification.countDocuments({
          user_id: user_id,
          is_read: false,
        });
        console.log(un_read_count);
        return {
          notification: notification_data,
          un_read_count: un_read_count,
        };
      };

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
            data_reference_id: activity_id,
            message: clientMessage,
          });
          eventEmitter(
            "NOTIFICATION",
            await with_unread_count(clientNotification, payload.client_id),
            payload.client_id
          );
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
            data_reference_id: activity_id,
            message: assignToMessage,
          });

          eventEmitter(
            "NOTIFICATION",
            await with_unread_count(assignToNotification, payload.assign_to),
            payload.assign_to
          );
        }
        if (payload.activity_type_action === "update") {
          const clientMessage = replaceFields(
            returnNotification("activity", "activityUpdated", "clientMessage"),
            { ...payload }
          );
          const clientNotification = await Notification.create({
            user_id: payload.client_id,
            type: "activity",
            data_reference_id: activity_id,
            message: clientMessage,
          });
          eventEmitter(
            "NOTIFICATION",
            await with_unread_count(clientNotification, payload.client_id),
            payload.client_id
          );
          const assignToMessage = replaceFields(
            returnNotification(
              "activity",
              "activityUpdated",
              "assignToMessage"
            ),
            { ...payload }
          );
          const assignToNotification = await Notification.create({
            user_id: payload.assign_to,
            type: "activity",
            data_reference_id: activity_id,
            message: assignToMessage,
          });

          eventEmitter(
            "NOTIFICATION",
            await with_unread_count(assignToNotification, payload.assign_to),
            payload.assign_to
          );
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
            data_reference_id: activity_id,
            message: clientMessage,
          });
          eventEmitter(
            "NOTIFICATION",
            await with_unread_count(clientNotification, payload.client_id),
            payload.client_id
          );
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
            data_reference_id: activity_id,
            message: assignToMessage,
          });

          eventEmitter(
            "NOTIFICATION",
            await with_unread_count(assignToNotification, payload.assign_to),
            payload.assign_to
          );
        }
        if (payload.activity_type_action === "completed") {
          const clientMessage = replaceFields(
            returnNotification(
              "activity",
              "activityCompleted",
              "clientMessage"
            ),
            {
              ...payload,
            }
          );
          const clientNotification = await Notification.create({
            user_id: payload.client_id,
            type: "activity",
            data_reference_id: activity_id,
            message: clientMessage,
          });
          eventEmitter(
            "NOTIFICATION",
            await with_unread_count(clientNotification, payload.client_id),
            payload.client_id
          );
          const assignToMessage = replaceFields(
            returnNotification(
              "activity",
              "activityCompleted",
              "assignToMessage"
            ),
            { ...payload }
          );
          const assignToNotification = await Notification.create({
            user_id: payload.assign_to,
            type: "activity",
            data_reference_id: activity_id,
            message: assignToMessage,
          });

          eventEmitter(
            "NOTIFICATION",
            await with_unread_count(assignToNotification, payload.assign_to),
            payload.assign_to
          );
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
            data_reference_id: activity_id,
            message: clientMessage,
          });
          eventEmitter(
            "NOTIFICATION",
            await with_unread_count(clientNotification, payload.client_id),
            payload.client_id
          );
          const assignToMessage = replaceFields(
            returnNotification("activity", "createTask", "assignToMessage"),
            { ...payload }
          );

          const assignToNotification = await Notification.create({
            user_id: payload.assign_to,
            type: "task",
            data_reference_id: activity_id,
            message: assignToMessage,
          });
          eventEmitter(
            "NOTIFICATION",
            await with_unread_count(assignToNotification, payload.assign_to),
            payload.assign_to
          );
        }

        if (payload.activity_type_action === "completed") {
          const clientMessage = replaceFields(
            returnNotification("activity", "taskCompleted", "clientMessage"),
            {
              ...payload,
            }
          );
          const clientNotification = await Notification.create({
            user_id: payload.client_id,
            type: "task",
            data_reference_id: activity_id,
            message: clientMessage,
          });
          eventEmitter(
            "NOTIFICATION",
            await with_unread_count(clientNotification, payload.client_id),
            payload.client_id
          );
          const assignToMessage = replaceFields(
            returnNotification("activity", "taskCompleted", "assignToMessage"),
            { ...payload }
          );
          const assignToNotification = await Notification.create({
            user_id: payload.assign_to,
            type: "task",
            data_reference_id: activity_id,
            message: assignToMessage,
          });

          eventEmitter(
            "NOTIFICATION",
            await with_unread_count(assignToNotification, payload.assign_to),
            payload.assign_to
          );
        }

        if (payload.activity_type_action === "update") {
          const clientMessage = replaceFields(
            returnNotification("activity", "taskUpdated", "clientMessage"),
            {
              ...payload,
            }
          );
          const clientNotification = await Notification.create({
            user_id: payload.client_id,
            type: "task",
            data_reference_id: activity_id,
            message: clientMessage,
          });
          eventEmitter(
            "NOTIFICATION",
            await with_unread_count(clientNotification, payload.client_id),
            payload.client_id
          );
          const assignToMessage = replaceFields(
            returnNotification("activity", "taskUpdated", "assignToMessage"),
            { ...payload }
          );
          const assignToNotification = await Notification.create({
            user_id: payload.assign_to,
            type: "task",
            data_reference_id: activity_id,
            message: assignToMessage,
          });

          eventEmitter(
            "NOTIFICATION",
            await with_unread_count(assignToNotification, payload.assign_to),
            payload.assign_to
          );
        }
        if (payload.activity_type_action === "deleted") {
          console.log("first");
          const clientMessage = replaceFields(
            returnNotification("activity", "taskDeleted", "clientMessage"),
            { ...payload }
          );
          const clientNotification = await Notification.create({
            user_id: payload.client_id,
            type: "task",
            data_reference_id: activity_id,
            message: clientMessage,
          });
          eventEmitter(
            "NOTIFICATION",
            await with_unread_count(clientNotification, payload.client_id),
            payload.client_id
          );
          const assignToMessage = replaceFields(
            returnNotification("activity", "taskDeleted", "assignToMessage"),
            { ...payload }
          );
          const assignToNotification = await Notification.create({
            user_id: payload.assign_to,
            type: "task",
            data_reference_id: activity_id,
            message: assignToMessage,
          });

          eventEmitter(
            "NOTIFICATION",
            await with_unread_count(assignToNotification, payload.assign_to),
            payload.assign_to
          );
        }
      }

      return;
    } catch (error) {
      logger.error(`Error while fetching agencies: ${error}`);
      return throwError(error?.message, error?.statusCode);
    }
  };

  // Get Notifications
  getNotification = async (user, searchObj) => {
    try {
      const { skip, limit } = searchObj;

      const notifications = await Notification.find({
        user_id: user.reference_id,
      })
        .sort({ createdAt: -1, is_read: -1 })
        .skip(skip)
        .limit(limit);

      const un_read_count = await Notification.find({
        user_id: user.reference_id,
        is_read: false,
      }).countDocuments();
      return { notificationList: notifications, un_read_count: un_read_count };
    } catch (error) {
      logger.error(`Error while fetching agencies: ${error}`);
      return throwError(error?.message, error?.statusCode);
    }
  };

  // Read Notifications

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
