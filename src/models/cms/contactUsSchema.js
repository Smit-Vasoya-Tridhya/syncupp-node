const mongoose = require("mongoose");
const { admin_connection } = require("../../config/connection");

const contactUsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
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
  },
  { timestamps: true }
);

const Contact_Us = admin_connection.model("contact_us_cms", contactUsSchema);

module.exports = Contact_Us;
