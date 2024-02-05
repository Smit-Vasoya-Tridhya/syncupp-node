const mongoose = require("mongoose");
const { admin_connection } = require("../config/connection");

const admintermAndConditionSchema = new mongoose.Schema(
  {
    title: { type: String, requried: true },
    description: { type: String, required: true },
    is_deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const AdminTermAndCondition = admin_connection.model("admin_term_and_condition", admintermAndConditionSchema);
module.exports = AdminTermAndCondition;
