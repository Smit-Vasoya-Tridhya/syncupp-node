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
      ref: "agency_type_master",
      required: true,
    },
  },
  { timestamps: true }
);

const Team_Agency = crm_connection.model("team_agency", teamAgencySchema);
module.exports = Team_Agency;
