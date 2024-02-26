const Chat = require("../models/chatSchema");
const logger = require("../logger");
const { throwError } = require("../helpers/errorUtil");

class ChatService {
  // this function is used to get hte history between 2 users
  chatHistory = async (user) => {
    try {
      const chat_aggragate = [];
    } catch (error) {
      logger.error(`Erroe while fetching the chat history: ${error}`);
      return throwError(error?.message, error?.statusCode);
    }
  };

  // this function is used to fetched the all of the users where we have started the chat
  fetchUsersList = async (user) => {
    try {
      const aggragate = [
        {
          $match: {
            $or: [
              { from_user: user?.reference_id },
              { to_user: user?.reference_id },
            ],
          },
        },
        {
          $lookup: {
            from: "authentications",
            localField: "from_user",
            foreignField: "reference_id",
            as: "from_user",
            pipeline: [
              {
                $project: {
                  _id: 1,
                  name: 1,
                  first_name: 1,
                  last_name: 1,
                  email: 1,
                  assigned_to_name: {
                    $concat: ["$first_name", " ", "$last_name"],
                  },
                  role: 1,
                },
              },
            ],
          },
        },
        {
          $unwind: { path: "$from_user", preserveNullAndEmptyArrays: true },
        },
        {
          $lookup: {
            from: "authentications",
            localField: "to_user",
            foreignField: "reference_id",
            as: "to_user",
            pipeline: [
              {
                $project: {
                  _id: 1,
                  name: 1,
                  first_name: 1,
                  last_name: 1,
                  email: 1,
                  assigned_to_name: {
                    $concat: ["$first_name", " ", "$last_name"],
                  },
                  role: 1,
                },
              },
            ],
          },
        },
        {
          $unwind: { path: "$to_user", preserveNullAndEmptyArrays: true },
        },
      ];
      const users = await Chat.aggregate(aggragate).sort({ createdAt: -1 });

      let usersIdString = [];
      let usersList = [];

      // below loop is used to get the unique users list where user had chat
      for (let i = 0; i < users.length; i++) {
        let touser = users[i]?.to_user?._id.toString();
        let fromuser = users[i].fromUser._id.toString();

        if (fromuser == req.user._id && !usersIdString.includes(touser)) {
          usersIdString.push(touser);

          if (users[i].toUser == null) {
            continue;
          }
          if (users[i].toUser && users[i].toUser.lastName) {
            users[i].toUser.lastName = users[i].toUser.lastName
              .charAt(0)
              .toUpperCase();
          }

          const unRead = await unreadMesssages.some(
            (e) =>
              e.fromUser.toString() == users[i].toUser._id.toString() &&
              e.toUser.toString() == req.user._id.toString()
          );
          if (unRead) {
            users[i].toUser.unRead = true;
          } else {
            users[i].toUser.unRead = false;
          }
          users.push(users[i].toUser);
        } else if (
          touser == req.user._id &&
          !usersIdString.includes(fromuser)
        ) {
          usersIdString.push(fromuser);
          // data = await User.findById(users[i].fromUser)
          //   .select("firstName lastName userName profilePhoto")
          //   .lean();
          if (users[i].fromUser == null) {
            continue;
          }
          if (users[i].fromUser && users[i].fromUser.lastName) {
            users[i].fromUser.lastName = users[i].fromUser.lastName
              .charAt(0)
              .toUpperCase();
          }

          const unRead = await unreadMesssages.some(
            (e) =>
              e.fromUser.toString() == users[i].fromUser._id.toString() &&
              e.toUser.toString() == req.user._id.toString()
          );

          // const unRead = await Notification.findOne({
          //   fromUser: users[i].fromUser._id,
          //   toUser: req.user._id,
          //   type: "CHATNOTIFICATION",
          //   read: false,
          // });
          if (unRead) {
            users[i].fromUser.unRead = true;
          } else {
            users[i].fromUser.unRead = false;
          }
          users.push(users[i].fromUser);
        }
      }
    } catch (error) {
      logger.error(`Error while fetching the users list: ${error}`);
      return throwError(error?.message, error?.statusCode);
    }
  };
}

module.exports = ChatService;
