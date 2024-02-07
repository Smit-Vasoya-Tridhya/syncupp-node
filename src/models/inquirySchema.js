const mongoose = require("mongoose");
const { admin_connection } = require("../config/connection");

const inquirySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    contact_number: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    is_deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const inquiry = admin_connection.model("inquiry", inquirySchema);
module.exports = inquiry;
