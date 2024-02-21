let io;
const { Server } = require("socket.io");
const logger = require("./logger/logger");

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

    socket.on("ROOM", (obj) => {
      console.log(obj.id, 15);
      socket.join(obj.id);
    });

    socket.on("CONFIRMATION", (payload) => {
      console.log(`Event Confirmation : ${payload}`);
    });
  });
};

exports.eventEmitter = (event_name, payload, user_id) => {
  try {
    console.log("Inside", event_name, payload, user_id);
    io.to(user_id.toString()).emit(event_name, payload);
  } catch (error) {
    console.log("Error while emitting socket error", error);
  }
};

exports.sendNotification = (userId, notification) => {
  try {
    io.to(userId).emit("notification", notification);
  } catch (error) {
    console.log("Error while sendNotification socket error", error);
  }
};
