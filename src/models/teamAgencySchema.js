const mongoose = require("mongoose");
const { crm_connection } = require("../config/connection");

const teamAgencySchema = new mongoose.Schema(
  {
    agency_id: { type: String, requried: true },
    role: { type: mongoose.Types.ObjectId, ref: "role_master", required: true },
  },
  { timestamps: true }
);

const TeamAgency = crm_connection.model("team_agency", teamAgencySchema);
module.exports = TeamAgency;
