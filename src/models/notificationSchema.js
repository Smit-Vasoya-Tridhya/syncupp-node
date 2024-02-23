const mongoose = require("mongoose");
const { crm_connection } = require("../config/connection");
const { boolean } = require("webidl-conversions");

const notificationSchema = new mongoose.Schema(
  {
    client_info: {
      _id: {
        type: mongoose.Types.ObjectId,
      },
      is_read: {
        type: Boolean,
        default: false,
      },
    },
    assign_to: {
      _id: {
        type: mongoose.Types.ObjectId,
      },
      is_read: {
        type: Boolean,
        default: false,
      },
    },
    assign_by: {
      _id: {
        type: mongoose.Types.ObjectId,
      },
      is_read: {
        type: Boolean,
        default: false,
      },
    },
    data: {
      activity_type: { type: String },
      reference_id: { type: mongoose.Types.ObjectId },
    },
    message: { type: String },
  },
  { timestamps: true }
);

const Notification = crm_connection.model("notification", notificationSchema);

module.exports = Notification;
