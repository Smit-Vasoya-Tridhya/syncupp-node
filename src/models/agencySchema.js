const mongoose = require("mongoose");
const { crm_connection } = require("../config/connection");

const agencySchema = new mongoose.Schema(
  {
    company_name: { type: String },
    company_website: { type: String },
    no_of_people: { type: String },
    industry: { type: mongoose.Types.ObjectId, ref: "agency_type_master" },
  },
  { timestamps: true }
);

const Agency = crm_connection.model("agency", agencySchema);

module.exports = Agency;
