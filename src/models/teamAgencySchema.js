const mongoose = require("mongoose");
const { crm_connection } = require("../config/connection");

const teamAgencySchema = new mongoose.Schema(
  {
    agency_id: {
      type: mongoose.Types.ObjectId,
      ref: "agency",
      required: true,
    },
    role: {
      type: mongoose.Types.ObjectId,
      ref: "team_role_master",
      required: true,
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Team_Agency = crm_connection.model("team_agency", teamAgencySchema);
module.exports = Team_Agency;
