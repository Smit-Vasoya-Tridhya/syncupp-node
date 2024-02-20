const mongoose = require("mongoose");
const { crm_connection } = require("../config/connection");

const notificationSchema = new mongoose.Schema({}, { timestamps: true });

const Notification = crm_connection.model("notification", notificationSchema);

module.exports = Notification;
