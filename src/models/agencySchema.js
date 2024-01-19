const mongoose = require("mongoose");
const { crm_connection } = require("../config/connection");

const agencySchema = new mongoose.Schema(
  {
    company_name: { type: String },
    company_website: { type: String },
    no_of_people: { type: String },
    industry: { type: String },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: String },
    pin_code: { type: Number },
  },
  { timestamps: true }
);

const Agency = crm_connection.model("agency", agencySchema);

module.exports = Agency;
