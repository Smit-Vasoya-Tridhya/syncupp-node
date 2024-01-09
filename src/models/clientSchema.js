const mongoose = require("mongoose");
const { crm_connection } = require("../config/connection");

const clientSchema = new mongoose.Schema(
  {
    company_name: { type: String },
    company_website: { type: String },
    no_of_people: { type: String },
    // industry: { type: mongoose.Types.ObjectId, ref: "agency_type_master" },
    industry: { type: String },
  },
  { timestamps: true }
);

const Client = crm_connection.model("client", clientSchema);

module.exports = Client;
