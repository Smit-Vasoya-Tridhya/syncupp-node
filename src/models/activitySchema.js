const mongoose = require("mongoose");
const { crm_connection } = require("../config/connection");

const activitySchema = new mongoose.Schema(
  {
    activity_type: {
      type: mongoose.Types.ObjectId,
      ref: "activity_type_master",
      required: true,
    },
    title: { type: String },
    agenda: { type: String },
    due_date: { type: Date },
    due_time: { type: String },
    client_id: { type: mongoose.Types.ObjectId, ref: "client", required: true },
    internal_info: { type: String },
    assign_to: { type: mongoose.Types.ObjectId },
    assign_by: { type: mongoose.Types.ObjectId },
    agency_id: { type: mongoose.Types.ObjectId },
    meeting_start_time: { type: Date },
    meeting_end_time: { type: Date },
    recurring_end_date: { type: Date },
    activity_status: {
      type: mongoose.Types.ObjectId,
      ref: "activity_status_master",
      required: true,
    },
    is_deleted: { type: Boolean, default: false },
    mark_as_done: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Activity = crm_connection.model("activity", activitySchema);
module.exports = Activity;
