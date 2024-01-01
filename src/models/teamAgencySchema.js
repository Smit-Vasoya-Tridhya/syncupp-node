const mongoose = require("mongoose");
const { crm_connection } = require("../config/connection");

const teamAgencySchema = new mongoose.Schema(
  {
    // agency_id: { type: String, requried: true, unique: true },
    name: { type: String },
    first_name: { type: String },
    last_name: { type: String },
    email: { type: String, unique: true },
    role: { type: String },
    password: { type: String, unique: true },
    contact_no: { type: String },
    token: { type: String },
    token_expiry: { type: Date },
    is_verified: { type: Boolean, default: false },
    is_deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const TeamAgency = crm_connection.model("teamAgency", teamAgencySchema);
module.exports = TeamAgency;
