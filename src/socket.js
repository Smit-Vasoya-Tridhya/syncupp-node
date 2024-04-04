let io;
const { Server } = require("socket.io");
const logger = require("./logger");
const { throwError } = require("./helpers/errorUtil");
const Chat = require("./models/chatSchema");
const Notification = require("./models/notificationSchema");
const {
  returnMessage,
  returnNotification,
  capitalizeFirstLetter,
} = require("./utils/utils");
const fs = require("fs");
const Authentication = require("./models/authenticationSchema");
const Group_Chat = require("./models/groupChatSchema");
const Configuration = require("./models/configurationSchema");
const { default: mongoose } = require("mongoose");

exports.socket_connection = (http_server) => {
  io = new Server(http_server, {
    cors: {
      origin: [
        "http://172.16.0.241:3000",
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost",
        "http://104.248.10.11:5010",
        "http://104.248.10.11",
        "http://104.248.10.11:5014",
        "https://app.syncupp.com",
        "https://app.syncupp.com:5014",
        "https://syncupp.com",
        "http://localhost:5014",
        "http://139.59.15.81:5010",
      ],
      methods: ["GET", "PATCH", "POST", "HEAD", "OPTIONS"],
    },
  });

  io.on("connection", (socket) => {
    logger.info(`Socket connected ${socket.id}`);
    socket.on("disconnect", () => {
      logger.info(`Socket ${socket.id} has disconnected.`);
    });

    // this event is used to group join event
    socket.on("JOIN_ROOM", (payload) => {
      socket.join(payload?._id?.toString());
    });

    // For user joined
    socket.on("ROOM", async (obj) => {
      logger.info(obj.id, 15);
      console.log(obj.id);
      socket.join(obj.id);

      // this is used to fetch the group chat id to join that group chat id so they can receive the group chat messages
      let group_ids = await Group_Chat.distinct("_id", {
        members: { $in: [obj.id] },
      });
      group_ids.forEach((group_id) => socket.join(group_id.toString()));
      // for the Online status
      await Authentication.findOneAndUpdate(
        { reference_id: obj?.id },
        { is_online: true },
        { new: true }
      );
      socket.broadcast.emit("USER_ONLINE", { user_id: obj.id });
    });

    socket.on("USER_DISCONNECTED", async (payload) => {
      // for the Offline status
      const user = await Authentication.findByIdAndUpdate(
        payload?.user_id,
        { is_online: false },
        { new: true }
      ).lean();
      socket.broadcast.emit("USER_OFFLINE", { user_id: user?.reference_id });
    });

    // When Data delivered
    socket.on("CONFIRMATION", (payload) => {
      logger.info(
        `Event Confirmation : ${payload?.event} ${payload.name} ${payload.id}`
      );
    });

    // this Socket event is used to send message to the Other user
    socket.on("SEND_MESSAGE", async (payload) => {
      try {
        console.log("SEND_MESSAGE");
        const { from_user, to_user, message, user_type } = payload;

        const new_chat = await Chat.create({
          from_user,
          to_user,
          message,
        });

        // commenting for the better optimised solution
        // await Notification.create({
        //   type: "chat",
        //   user_id: payload?.to_user,
        //   from_user,
        //   data_reference_id: new_chat?._id,
        //   message,
        //   user_type,
        // });

        // emiting the message to the sender to solve multiple device synchronous
        io.to(from_user).emit("RECEIVED_MESSAGE", {
          from_user,
          to_user,
          message,
          createdAt: new_chat.createdAt,
          _id: new_chat?._id,
          user_type,
          message_type: new_chat?.message_type,
        });

        socket.to(to_user).emit("RECEIVED_MESSAGE", {
          from_user,
          to_user,
          message,
          createdAt: new_chat.createdAt,
          _id: new_chat?._id,
          user_type,
          message_type: new_chat?.message_type,
        });
      } catch (error) {
        logger.error(`Error while sending the message: ${error}`);
        return throwError(error?.message, error?.statusCode);
      }
    });

    // this socket event is used when sender and receiver are chating at the same time
    // the use of this event that delete the all of the notification of the unread messages
    // So it will not display at the same time of the chat
    socket.on("NOT_ONGOING_CHAT", async (payload) => {
      try {
        console.log("NOT_ONGOING_CHAT");
        const notification_exist = await Notification.findOne({
          user_id: payload?.to_user,
          from_user: payload?.from_user,
          type: "chat",
          is_read: false,
          is_deleted: false,
        });

        if (!notification_exist) {
          const sender_detail = await Authentication.findOne({
            reference_id: payload?.from_user,
          })
            .select("first_name last_name profile_image")
            .lean();
          let notification_message = returnNotification("chat", "newMessage");
          notification_message = notification_message.replaceAll(
            "{{sender_name}}",
            capitalizeFirstLetter(sender_detail?.first_name) +
              " " +
              capitalizeFirstLetter(sender_detail?.last_name)
          );
          const notification = await Notification.create({
            type: "chat",
            user_id: payload?.to_user,
            from_user: payload?.from_user,
            data_reference_id: payload?._id,
            message: notification_message,
            user_type: payload?.user_type,
          });

          const pending_notification = await Notification.countDocuments({
            user_id: payload?.to_user,
            is_read: false,
          });

          const user_id = payload?.to_user?.toString();
          io.to(user_id).emit("NOTIFICATION", {
            notification,
            un_read_count: pending_notification,
          });
        }
      } catch (error) {
        logger.error(`Error while receiving the message: ${error}`);
        return throwError(error?.message, error?.statusCode);
      }
    });

    // This socket event is used for the delete the message if the message is not seen by the other user
    socket.on("DELETE_MESSAGE", async (payload) => {
      try {
        // stopped because of the some limitations
        // const is_message_seen = await Notification.findOne({
        //   from_user: payload?.from_user,
        //   user_id: payload?.to_user,
        //   is_read: false,
        //   type: "chat",
        // }).lean();

        // if (is_message_seen)
        //   io.to(payload?.from_user?.toString()).emit("CANNOT_DELETE", {
        //     error: returnMessage("chat", "canNotDelete"),
        //   });

        const message = await Chat.findById(payload?.chat_id).lean();

        if (message?.image_url || message?.document_url) {
          if (
            message?.image_url &&
            fs.existsSync(`./src/public/uploads/${message?.image_url}`)
          ) {
            fs.unlink(`./src/public/uploads/${message?.image_url}`, (err) => {
              if (err) {
                logger.error(`Error while unlinking the image: ${err}`);
              }
            });
          } else if (
            message?.document_url &&
            fs.existsSync(`./src/public/uploads/${message?.document_url}`)
          ) {
            fs.unlink(
              `./src/public/uploads/${message?.document_url}`,
              (err) => {
                if (err) {
                  logger.error(`Error while unlinking the documents: ${err}`);
                }
              }
            );
          }
        }

        await Chat.findByIdAndUpdate(payload?.chat_id, { is_deleted: true });
        io.to([
          payload?.from_user.toString(),
          payload?.to_user.toString(),
        ]).emit("MESSGAE_DELETED", {
          message: returnMessage("chat", "messageDeleted"),
          _id: payload?.chat_id,
        });
      } catch (error) {
        logger.error(`Error while deleting the message: ${error}`);
        return throwError(error?.message, error?.statusCode);
      }
    });

    // commented because of the api implementations
    // this socket event is used to send the images between the users
    socket.on("IMAGES", async (payload) => {
      try {
        console.log("IMAGES");
        const { from_user, to_user, buffer, user_type, ext } = payload;

        const configuration = await Configuration.findOne().lean();
        // removed the size validaions
        if (
          Buffer.byteLength(buffer) / (1024 * 1024) >
          configuration?.chat?.file_size
        ) {
          let message = returnMessage("chat", "largeImage");
          message = replaceAll("{{file_size}}", configuration?.chat?.file_size);
          io.to(from_user?.toString()).emit("FILE_TO_LARGE", {
            error: message,
          });
          return;
        }

        const required_image_type = ["jpeg", "jpg", "png"];

        if (!required_image_type.includes(ext)) {
          io.to(from_user).emit("INVALID_FORMAT", {
            error: returnMessage("chat", "invalidImageFormat"),
          });
          return;
        }

        if (ext) {
          const image_name = Date.now() + "." + ext;
          fs.writeFileSync("./src/public/uploads/" + image_name, buffer, {
            encoding: "base64",
          });

          const new_message = await Chat.create({
            from_user: payload?.from_user,
            to_user: payload?.to_user,
            image_url: image_name,
            message_type: "image",
          });

          io.to(from_user).emit("RECEIVED_IMAGE", {
            image_url: image_name,
            from_user,
            to_user,
            message_type: new_message?.message_type,
            _id: new_message?._id,
            createdAt: new_message?.createdAt,
            user_type,
          });

          socket.to(to_user).emit("RECEIVED_IMAGE", {
            image_url: image_name,
            from_user,
            to_user,
            message_type: new_message?.message_type,
            _id: new_message?._id,
            createdAt: new_message?.createdAt,
            user_type,
          });
        }
      } catch (error) {
        logger.error(`Error while uploading the images: ${error}`);
        return throwError(error?.message, error?.statusCode);
      }
    });

    // commented because of the api implementations
    // this socket event is used to send the documents between the users
    socket.on("DOCUMENTS", async (payload) => {
      try {
        console.log("DOCUMENTS");
        const { from_user, to_user, buffer, user_type, ext } = payload;

        const configuration = await Configuration.findOne().lean();

        if (
          Buffer.byteLength(buffer) / (1024 * 1024) >
          configuration?.chat?.file_size
        ) {
          let message = returnMessage("chat", "largeDocument");
          message = replaceAll("{{file_size}}", configuration?.chat?.file_size);
          socket.to(from_user?.toString()).emit("FILE_TO_LARGE", {
            error: message,
          });
          return;
        }
        const required_image_type = ["pdf", "xlsx", "csv", "doc", "docx"];

        if (!required_image_type.includes(ext)) {
          io.to(from_user).emit("INVALID_FORMAT", {
            error: returnMessage("chat", "invalidDocumentFormat"),
          });
          return;
        }

        if (ext) {
          const document_name = Date.now() + "." + ext;
          fs.writeFileSync("./src/public/uploads/" + document_name, buffer, {
            encoding: "base64",
          });

          const new_message = await Chat.create({
            from_user: payload?.from_user,
            to_user: payload?.to_user,
            document_url: document_name,
            message_type: "document",
          });

          // commenting for the better optimised solution
          // await Notification.create({
          //   user_id: payload?.to_user,
          //   type: "chat",
          //   from_user: payload?.from_user,
          //   data_reference_id: new_message?._id,
          // });
          console.log([from_user.toString(), to_user.toString()]);
          io.to([from_user.toString(), to_user.toString()]).emit(
            "RECEIVED_DOCUMENT",
            {
              document_url: document_name,
              user_type,
              from_user,
              to_user,
              createdAt: new_message?.createdAt,
              _id: new_message?._id,
              message_type: new_message?.message_type,
            }
          );
        }
      } catch (error) {
        logger.error(`Error while uploading the Documents: ${error}`);
        return throwError(error?.message, error?.statusCode);
      }
    });

    // this socket event is used to clear all of the chats between 2 users
    socket.on("CLEAR_CHAT", async (payload) => {
      try {
        await Chat.updateMany(
          {
            $or: [
              {
                $and: [
                  { from_user: payload?.from_user },
                  { to_user: payload?.to_user },
                ],
              },
              {
                $and: [
                  { from_user: payload?.to_user },
                  { to_user: payload?.from_user },
                ],
              },
            ],
          },
          { is_deleted: true }
        );

        await Notification.updateMany(
          {
            $or: [
              {
                $and: [
                  { user_id: payload?.from_user },
                  { from_user: payload?.to_user },
                ],
              },
              {
                $and: [
                  { user_id: payload?.to_user },
                  { from_user: payload?.from_user },
                ],
              },
            ],
          },
          { is_deleted: true, is_read: true }
        );

        socket.to(to_user).emit("CHAT_CLEARED", { message: `Chat is cleared` });
      } catch (error) {
        logger.error(`Error while clearing the chat: ${error}`);
        return throwError(error?.message, error?.statusCode);
      }
    });

    // this Socket event is used to send message to the Other user
    socket.on("GROUP_SEND_MESSAGE", async (payload) => {
      try {
        console.log("GROUP_SEND_MESSAGE");
        const { from_user, group_id, message } = payload;

        const [new_chat, user_detail, group_detail] = await Promise.all([
          Chat.create({
            from_user,
            group_id,
            message,
          }),
          Authentication.findOne({ reference_id: from_user })
            .select("first_name last_name reference_id profile_image")
            .lean(),
          Group_Chat.findById(group_id).lean(),
        ]);

        // emiting the message to the sender to solve multiple device synchronous
        // io.to(from_user).emit("GROUP_RECEIVED_MESSAGE", {
        //   from_user,
        //   group_id,
        //   message,
        //   createdAt: new_chat.createdAt,
        //   _id: new_chat?._id,
        //   message_type: new_chat?.message_type,
        //   user_detail,
        //   members: group_detail?.members,
        // });

        io.to(group_id).emit("GROUP_RECEIVED_MESSAGE", {
          from_user,
          group_id,
          message,
          createdAt: new_chat.createdAt,
          _id: new_chat?._id,
          message_type: new_chat?.message_type,
          user_detail,
          members: group_detail?.members,
        });
      } catch (error) {
        logger.error(`Error while sending the in the group: ${error}`);
        return throwError(error?.message, error?.statusCode);
      }
    });

    // This socket event is used to create the notification for the members if they have not read the message
    socket.on("NOT_ONGOING_GROUP_CHAT", async (payload) => {
      try {
        console.log("NOT_ONGOING_GROUP_CHAT");
        const group_detail = await Group_Chat.findById(payload?.group_id)
          .select("group_name")
          .lean();
        payload?.members?.forEach(async (member) => {
          if (member.toString() == payload?.from_user?.toString()) return;
          const notification_exist = await Notification.findOne({
            group_id: payload?.group_id,
            user_id: member,
            type: "group",
            is_read: false,
            is_deleted: false,
          });

          if (!notification_exist) {
            let notification_message = returnNotification(
              "chat",
              "newGroupMessage"
            );

            notification_message = notification_message.replaceAll(
              "{{group_name}}",
              capitalizeFirstLetter(group_detail?.group_name)
            );
            const notification = await Notification.create({
              type: "group",
              group_id: payload?.group_id,
              user_id: member,
              data_reference_id: payload?._id,
              message: notification_message,
            });

            const pending_notification = await Notification.countDocuments({
              user_id: member,
              type: "group",
              group_id: payload?.group_id,
              user_id: member,
              is_read: false,
            });
            const member_id = member?.toString();
            io.to(member_id).emit("NOTIFICATION", {
              notification,
              un_read_count: pending_notification,
            });
          }
        });
      } catch (error) {
        logger.error(`Error while receiving the message in group: ${error}`);
        return throwError(error?.message, error?.statusCode);
      }
    });

    // commented because of the api implementations
    // this socket event is used to send the images between the users
    socket.on("GROUP_IMAGES", async (payload) => {
      try {
        console.log("GROUP_IMAGES");

        const { from_user, group_id, buffer, ext } = payload;
        const configuration = await Configuration.findOne().lean();

        if (
          Buffer.byteLength(buffer) / (1024 * 1024) >
          configuration?.chat?.file_size
        ) {
          let message = returnMessage("chat", "largeImage");
          message = replaceAll("{{file_size}}", configuration?.chat?.file_size);
          io.to(from_user?.toString()).emit("FILE_TO_LARGE", {
            error: message,
          });
          return;
        }
        const required_image_type = ["jpeg", "jpg", "png"];

        if (!required_image_type.includes(ext)) {
          io.to(from_user).emit("INVALID_FORMAT", {
            error: returnMessage("chat", "invalidImageFormat"),
          });
          return;
        }

        if (ext) {
          const image_name = Date.now() + "." + ext;
          fs.writeFileSync("./src/public/uploads/" + image_name, buffer, {
            encoding: "base64",
          });

          const new_message = await Chat.create({
            from_user: payload?.from_user,
            group_id: payload?.group_id,
            image_url: image_name,
            message_type: "image",
          });

          // commenting for the better optimised solution
          // await Notification.create({
          //   user_id: payload?.to_user,
          //   type: "chat",
          //   from_user: payload?.from_user,
          //   data_reference_id: new_message?._id,
          // });
          const user_detail = await Authentication.findOne({
            reference_id: from_user,
          })
            .select("first_name last_name reference_id profile_image")
            .lean();

          io.to(group_id).emit("GROUP_RECEIVED_IMAGE", {
            image_url: image_name,
            from_user,
            group_id,
            message_type: new_message?.message_type,
            _id: new_message?._id,
            createdAt: new_message?.createdAt,
            user_detail,
          });
        }
      } catch (error) {
        console.log(error);
        logger.error(`Error while uploading the images: ${error}`);
        return throwError(error?.message, error?.statusCode);
      }
    });

    // commented because of the api implementations
    // this socket event is used to send the documents between the users
    socket.on("GROUP_DOCUMENTS", async (payload) => {
      try {
        console.log("GROUP_DOCUMENTS");

        const { from_user, group_id, buffer, ext } = payload;

        const configuration = await Configuration.findOne().lean();

        if (
          Buffer.byteLength(buffer) / (1024 * 1024) >
          configuration?.chat?.file_size
        ) {
          let message = returnMessage("chat", "largeDocument");
          message = replaceAll("{{file_size}}", configuration?.chat?.file_size);
          io.to(from_user).emit("FILE_TO_LARGE", {
            error: message,
          });
          return;
        }

        const required_image_type = ["pdf", "xlsx", "csv", "doc", "docx"];

        if (!required_image_type.includes(ext)) {
          io.to(from_user).emit("INVALID_FORMAT", {
            error: returnMessage("chat", "invalidDocumentFormat"),
          });
          return;
        }

        if (ext) {
          const document_name = Date.now() + "." + ext;
          fs.writeFileSync("./src/public/uploads/" + document_name, buffer, {
            encoding: "base64",
          });

          const new_message = await Chat.create({
            from_user: payload?.from_user,
            group_id: payload?.group_id,
            document_url: document_name,
            message_type: "document",
          });

          // commenting for the better optimised solution
          // await Notification.create({
          //   user_id: payload?.to_user,
          //   type: "chat",
          //   from_user: payload?.from_user,
          //   data_reference_id: new_message?._id,
          // });

          const user_detail = await Authentication.findOne({
            reference_id: from_user,
          })
            .select("first_name last_name reference_id profile_image")
            .lean();

          io.to(group_id).emit("GROUP_RECEIVED_DOCUMENT", {
            document_url: document_name,
            from_user,
            group_id,
            createdAt: new_message?.createdAt,
            _id: new_message?._id,
            message_type: new_message?.message_type,
            user_detail,
          });
        }
      } catch (error) {
        logger.error(`Error while uploading the Documents: ${error}`);
        return throwError(error?.message, error?.statusCode);
      }
    });

    // This socket event is used for the delete the message if the message is not seen by the other user
    socket.on("GROUP_DELETE_MESSAGE", async (payload) => {
      try {
        // commenting because of the issue
        // const is_message_seen = await Notification.findOne({
        //   from_user: payload?.from_user,
        //   user_id: payload?.to_user,
        //   is_read: false,
        //   type: "chat",
        // }).lean();

        // if (is_message_seen)
        //   io.to(payload?.from_user?.toString()).emit("CANNOT_DELETE", {
        //     error: returnMessage("chat", "canNotDelete"),
        //   });

        const message = await Chat.findById(payload?.chat_id).lean();

        if (message?.image_url || message?.document_url) {
          if (
            message?.image_url &&
            fs.existsSync(`./src/public/uploads/${message?.image_url}`)
          ) {
            fs.unlink(`./src/public/uploads/${message?.image_url}`, (err) => {
              if (err) {
                logger.error(`Error while unlinking the image: ${err}`);
              }
            });
          } else if (
            message?.document_url &&
            fs.existsSync(`./src/public/uploads/${message?.document_url}`)
          ) {
            fs.unlink(
              `./src/public/uploads/${message?.document_url}`,
              (err) => {
                if (err) {
                  logger.error(`Error while unlinking the documents: ${err}`);
                }
              }
            );
          }
        }

        await Chat.findByIdAndUpdate(payload?.chat_id, { is_deleted: true });
        const group_detail = await Group_Chat.findById(
          message?.group_id
        ).lean();
        group_detail.members = group_detail?.members?.map((member) =>
          member?.toString()
        );
        io.to(group_detail.members).emit("GROUP_MESSGAE_DELETED", {
          message: returnMessage("chat", "messageDeleted"),
          _id: payload?.chat_id,
        });
      } catch (error) {
        logger.error(`Error while deleting the message: ${error}`);
        return throwError(error?.message, error?.statusCode);
      }
    });

    socket.on("REACTION_MESSAGE", async (payload) => {
      try {
        const { chat_id, reaction, from_user, to_user } = payload;

        // Find the message by ID in one-to-one chat
        const messages = await Chat.findById(chat_id);

        if (!messages) {
          // Handle error: Message not found
          return returnMessage("chat", "MessageNotOFund");
        }

        const existingReactionIndex = messages?.reactions?.findIndex(
          (reaction) => reaction.user.toString() === from_user.toString()
        );
        if (existingReactionIndex !== -1) {
          // Update existing reaction
          messages.reactions[existingReactionIndex].emoji = reaction;
        } else {
          // Add new reaction
          messages.reactions.push({ user: from_user, emoji: reaction });
        }

        // Add reaction to the message
        await messages.save();

        // const message = await Chat.aggregate([
        //   { $match: { _id: new mongoose.Types.ObjectId(chat_id) } },
        //   {
        //     $unwind:"$reactions",
        //   },
        //   {
        //     $lookup: {
        //       from: "authentications", // Collection name of your user model
        //       localField: "reactions.user",
        //       foreignField: "reference_id",
        //       as: "reactions.user",
        //       pipeline: [
        //         {
        //           $project: {
        //             first_name: 1,
        //             last_name: 1,
        //             profile_image: 1,
        //             reference_id: 1,
        //             emoji: 1,
        //           },
        //         },
        //       ],
        //     },
        //   },
        //   {
        //     $unwind: {
        //       path: "$reactions.user",
        //       preserveNullAndEmptyArrays: true,
        //     },
        //   },
        //   {
        //     $project: {
        //       first_name: "$reactions.user.first_name",
        //       last_name: "$reactions.user.last_name",
        //       profile_image: "$reactions.user.profile_image",
        //       message: 1,
        //       reactions: 1,
        //       createdAt: 1,
        //       is_deleted: 1,
        //       message_type: 1,
        //       _id: 1,
        //       to_user: 1,
        //       from_user: 1,
        //       emoji: "$reactions.user.emoji",
        //     },
        //   },
        // ]);
        const message = await Chat.aggregate([
          { $match: { _id: new mongoose.Types.ObjectId(chat_id) } },
          {
            $unwind: {
              path: "$reactions",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: "authentications", // Collection name of your user model
              localField: "reactions.user",
              foreignField: "reference_id",
              as: "reactions.user",
              pipeline: [
                {
                  $project: {
                    first_name: 1,
                    last_name: 1,
                    profile_image: 1,
                    reference_id: 1,
                  },
                },
              ],
            },
          },
          {
            $unwind: {
              path: "$reactions.user",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $project: {
              first_name: "$reactions.user.first_name",
              last_name: "$reactions.user.last_name",
              profile_image: "$reactions.user.profile_image",
              message: 1,
              image_url: 1,
              document_url: 1,
              reactions: 1,
              audio_url: 1,
              createdAt: 1,
              is_deleted: 1,
              message_type: 1,
              _id: 1,
              to_user: 1,
              from_user: 1,
            },
          },

          {
            $group: {
              _id: "$_id",
              message: { $first: "$message" },
              createdAt: { $first: "$createdAt" },
              is_deleted: { $first: "$is_deleted" },
              document_url: { $first: "$document_url" },
              image_url: { $first: "$image_url" },
              message_type: { $first: "$message_type" },
              to_user: { $first: "$to_user" },
              audio_url: { $first: "$audio_url" },
              from_user: { $first: "$from_user" },
              reactions: { $push: "$reactions" }, // Group reactions into an array
            },
          },
        ]);

        // Broadcast the new reaction to other users in the chat room
        io.to(from_user).emit("RECEIVED_REACTION", {
          message: message[0],
        });

        // Emit event to sender for real-time update
        socket.to(to_user).emit("RECEIVED_REACTION", {
          message: message[0],
        });
      } catch (error) {
        // Handle error
        console.error("Error while reacting to  message:", error);
      }
    });

    socket.on("GROUP_REACTION_MESSAGE", async (payload) => {
      try {
        const { chat_id, reaction, group_id, from_user } = payload;

        const [user_detail, group_detail] = await Promise.all([
          Authentication.findOne({ reference_id: from_user })
            .select("first_name last_name reference_id")
            .lean(),
          Group_Chat.findById(group_id).lean(),
        ]);

        // Find the message by ID in group chat
        const messages = await Chat.findById(chat_id);

        if (!messages) {
          // Handle error: Message not found
          return returnMessage("chat", "MessageNotOFund");
        }

        const existingReactionIndex = messages?.reactions?.findIndex(
          (reaction) => reaction?.user?.toString() === from_user?.toString()
        );
        if (existingReactionIndex !== -1) {
          // Update existing reaction
          messages.reactions[existingReactionIndex].emoji = reaction;
        } else {
          // Add new reaction
          messages.reactions.push({ user: from_user, emoji: reaction });
        }

        // Add reaction to the message
        await messages.save();

        let message_obj = await Chat.aggregate([
          { $match: { _id: new mongoose.Types.ObjectId(chat_id) } },
          {
            $unwind: { path: "$reactions", preserveNullAndEmptyArrays: true },
          },

          {
            $lookup: {
              from: "authentications", // Collection name of your user model
              localField: "reactions.user",
              foreignField: "reference_id",
              as: "reactions.user",
              pipeline: [
                {
                  $project: {
                    first_name: 1,
                    last_name: 1,
                    profile_image: 1,
                    reference_id: 1,
                  },
                },
              ],
            },
          },
          {
            $unwind: {
              path: "$reactions.user",
              preserveNullAndEmptyArrays: true,
            },
          },

          {
            $project: {
              first_name: "$reactions.user.first_name",
              last_name: "$reactions.user.last_name",
              profile_image: "$reactions.user.profile_image",
              message: 1,
              group_id: 1,
              reactions: 1,
              createdAt: 1,
              document_url: 1,
              image_url: 1,
              audio_url: 1,
              is_deleted: 1,
              message_type: 1,
              _id: 1,
              to_user: 1,
              from_user: 1,
            },
          },
          {
            $group: {
              _id: "$_id",
              message: { $first: "$message" },
              createdAt: { $first: "$createdAt" },
              is_deleted: { $first: "$is_deleted" },
              group_id: { $first: "$group_id" },
              document_url: { $first: "$document_url" },
              image_url: { $first: "$image_url" },
              audio_url: { $first: "$audio_url" },
              message_type: { $first: "$message_type" },
              to_user: { $first: "$to_user" },
              from_user: { $first: "$from_user" },
              reactions: { $push: "$reactions" }, // Group reactions into an array
            },
          },
        ]);

        io.to(group_id).emit("GROUP_RECEIVED_REACTION", {
          ...message_obj[0],
          user_detail,
        });
      } catch (error) {
        // Handle error
        console.error("Error while reacting to group message:", error);
      }
    });

    socket.on("REACTION_DELETE", async (payload) => {
      try {
        const { chat_id, reaction, from_user, to_user } = payload;

        // Find the message by ID
        const messages = await Chat.findById(chat_id);

        if (!messages) {
          // Handle error: Message not found
          return returnMessage("chat", "MessageNotFound");
        }

        // Find the index of the reaction by the user ID
        const existingReactionIndex = messages.reactions.findIndex(
          (reaction) => reaction.user.toString() === from_user.toString()
        );

        if (existingReactionIndex !== -1) {
          // Delete the reaction of the particular user
          messages.reactions.splice(existingReactionIndex, 1);
        }
        // Save the updated message
        await messages.save();
        //pipleline to fetch user detail of reacted message
        const message = await Chat.aggregate([
          { $match: { _id: new mongoose.Types.ObjectId(chat_id) } },
          {
            $unwind: {
              path: "$reactions",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: "authentications", // Collection name of your user model
              localField: "reactions.user",
              foreignField: "reference_id",
              as: "reactions.user",
              pipeline: [
                {
                  $project: {
                    first_name: 1,
                    last_name: 1,
                    profile_image: 1,
                    reference_id: 1,
                  },
                },
              ],
            },
          },
          {
            $unwind: {
              path: "$reactions.user",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $project: {
              first_name: "$reactions.user.first_name",
              last_name: "$reactions.user.last_name",
              profile_image: "$reactions.user.profile_image",
              message: 1,
              image_url: 1,
              document_url: 1,
              reactions: 1,
              createdAt: 1,
              is_deleted: 1,
              audio_url: 1,
              message_type: 1,
              _id: 1,
              to_user: 1,
              from_user: 1,
            },
          },

          {
            $group: {
              _id: "$_id",
              message: { $first: "$message" },
              createdAt: { $first: "$createdAt" },
              is_deleted: { $first: "$is_deleted" },
              document_url: { $first: "$document_url" },
              image_url: { $first: "$image_url" },
              audio_url: { $first: "$audio_url" },
              message_type: { $first: "$message_type" },
              to_user: { $first: "$to_user" },
              from_user: { $first: "$from_user" },
              reactions: { $push: "$reactions" }, // Group reactions into an array
            },
          },
        ]);

        // Broadcast the new reaction to other users in the chat room
        io.to(from_user).emit("RECEIVED_REACTION", {
          message: message[0],
        });

        // Emit event to sender for real-time update
        socket.to(to_user).emit("RECEIVED_REACTION", {
          message: message[0],
        });
      } catch (error) {
        // Handle error
        console.error("Error while reacting to message:", error);
      }
    });

    socket.on("GROUP_REACTION_DELETE", async (payload) => {
      try {
        const { chat_id, from_user, group_id } = payload;

        const [user_detail, group_detail] = await Promise.all([
          Authentication.findOne({ reference_id: from_user })
            .select("first_name last_name reference_id")
            .lean(),
          Group_Chat.findById(group_id).lean(),
        ]);
        // Find the message by ID
        const messages = await Chat.findById(chat_id);

        if (!messages) {
          // Handle error: Message not found
          return returnMessage("chat", "MessageNotFound");
        }

        // Find the index of the reaction by the user ID
        const existingReactionIndex = messages.reactions.findIndex(
          (reaction) => reaction.user.toString() === from_user.toString()
        );

        if (existingReactionIndex !== -1) {
          // Delete the reaction of the particular user
          messages?.reactions.splice(existingReactionIndex, 1);
        }

        // Save the updated message
        await messages.save();
        //pipleline to fetch user detail of reacted message
        let message_obj = await Chat.aggregate([
          { $match: { _id: new mongoose.Types.ObjectId(chat_id) } },
          {
            $unwind: { path: "$reactions", preserveNullAndEmptyArrays: true },
          },

          {
            $lookup: {
              from: "authentications", // Collection name of your user model
              localField: "reactions.user",
              foreignField: "reference_id",
              as: "reactions.user",
              pipeline: [
                {
                  $project: {
                    first_name: 1,
                    last_name: 1,
                    profile_image: 1,
                    reference_id: 1,
                  },
                },
              ],
            },
          },
          {
            $unwind: {
              path: "$reactions.user",
              preserveNullAndEmptyArrays: true,
            },
          },

          {
            $project: {
              first_name: "$reactions.user.first_name",
              last_name: "$reactions.user.last_name",
              profile_image: "$reactions.user.profile_image",
              message: 1,
              group_id: 1,
              reactions: 1,
              createdAt: 1,
              document_url: 1,
              audio_url: 1,
              image_url: 1,
              is_deleted: 1,
              message_type: 1,
              _id: 1,
              to_user: 1,
              from_user: 1,
            },
          },
          {
            $group: {
              _id: "$_id",
              message: { $first: "$message" },
              createdAt: { $first: "$createdAt" },
              is_deleted: { $first: "$is_deleted" },
              group_id: { $first: "$group_id" },
              document_url: { $first: "$document_url" },
              image_url: { $first: "$image_url" },
              message_type: { $first: "$message_type" },
              audio_url: { $first: "$audio_url" },
              to_user: { $first: "$to_user" },
              from_user: { $first: "$from_user" },
              reactions: { $push: "$reactions" }, // Group reactions into an array
            },
          },
        ]);
        io.to(group_id).emit("GROUP_RECEIVED_REACTION", {
          ...message_obj[0],
          user_detail,
        });
      } catch (error) {
        // Handle error
        console.error("Error while reacting to message:", error);
      }
    });
  });
};

exports.eventEmitter = (event_name, payload, user_id) => {
  try {
    if (Array.isArray(user_id)) {
      user_id.forEach((user_id) => {
        user_id = user_id?.toString();
        io.to(user_id).emit(event_name, payload);
      });
    } else {
      user_id = user_id?.toString();
      io.to(user_id).emit(event_name, payload);
    }
  } catch (error) {
    logger.info("Error while emitting socket error", error);
  }
};

exports.emitEvent = (event_name, payload, users) => {
  try {
    console.log(users, event_name, 719);
    users?.length > 0 && io.to(users).emit(event_name, payload);
  } catch (error) {
    console.log(`Error while emiting event`, error);
  }
};
