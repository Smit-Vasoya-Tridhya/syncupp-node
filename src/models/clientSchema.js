const mongoose = require("mongoose");
const { crm_connection } = require("../config/connection");

const clientSchema = new mongoose.Schema(
  {
    title: { type: String },
    company_name: { type: String, required: true },
    comapny_website: { type: String },
    address: { type: String },
    city: { type: mongoose.Schema.Types.ObjectId, ref: "city_master" },
    state: { type: mongoose.Schema.Types.ObjectId, ref: "state_master" },
    country: { type: mongoose.Schema.Types.ObjectId, ref: "country_master" },
    pincode: { type: Number },
    agency_ids: [
      {
        agency_id: { type: mongoose.Schema.Types.ObjectId, ref: "agency" },
        status: { type: String, enum: ["active", "inactive"] },
      },
    ],
  },
  { timestamps: true }
);

const Client = crm_connection.model("client", clientSchema);

module.exports = Client;
