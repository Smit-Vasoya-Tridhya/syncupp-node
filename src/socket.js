let io;
const { Server } = require("socket.io");
const logger = require("./logger/logger");

let activeUsers = [];

exports.socket_connection = (http_server) => {
  io = new Server(http_server, {
    cors: {
      origin: [
        "http://172.16.0.241:3000",
        "http://localhost:3000",
        "http://localhost",
      ],
    },
  });

  io.on("connection", (socket) => {
    console.log(`Socket connected ${socket.id}`);
    socket.on("disconnect", () => {
      console.log(`Socket ${socket.id} has disconnected.`);
    });
    socket.on("new-user-add", (user_id) => {
      // if user is not added previously
      if (!activeUsers.some((user) => user.userId === user_id)) {
        activeUsers.push({ userId: user_id, socketId: socket.id });
        console.log("New User Connected", activeUsers);
      }
      // send all active users to new user
      io.emit("get-users", activeUsers);
    });
  });
};

exports.sendNotification = (userId, notification) => {
  const user = activeUsers.find((user) => user.userId === userId);
  console.log("Sending from socket to :", userId);
  try {
    if (user) {
      console.log(user);
      io.to(user.socketId).emit("notification", notification);
      console.log("Notification sent");
    }
  } catch (error) {
    console.log("Error while sendNotification socket error", error);
  }
};
