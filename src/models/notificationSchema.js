const mongoose = require("mongoose");
const { crm_connection } = require("../config/connection");
const { boolean } = require("webidl-conversions");

const notificationSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Types.ObjectId,
    },
    type: { type: String },
    data_reference_id: { type: mongoose.Types.ObjectId },
    message: { type: String },
    is_read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Notification = crm_connection.model("notification", notificationSchema);

module.exports = Notification;
