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
    logger.info(`Socket connected ${socket.id}`);
    socket.on("disconnect", () => {
      logger.info(`Socket ${socket.id} has disconnected.`);
    });

    socket.on("NOTIFICATION", (obj) => {
      logger.info(obj.id, 15);
      socket.join(obj.id);
    });

    socket.on("createActivity", ({ user }) => {
      users[socket.id] = user;
      console.log(`${user} has joined `);
      socket.broadcast.emit("userJoined", {
        user: "Admin",
        message: ` ${[socket.id]} has joined`,
      });
      socket.emit("welcome", {
        user: "Admin",
        message: `Welcome to the chat,${users[socket.id]} `,
      });
    });

    socket.on("CONFIRMATION", (payload) => {
      logger.info(`Event Confirmation : ${payload}`);
    });
  });
};

exports.eventEmitter = (event_name, payload, user_id) => {
  try {
    console.log("Inside", event_name, payload, user_id);
    io.to(user_id.toString()).emit(event_name, payload);
  } catch (error) {
    logger.info("Error while emitting socket error", error);
  }
};
