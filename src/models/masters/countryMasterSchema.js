const mongoose = require("mongoose");
const { crm_connection } = require("../../config/connection");

const country_master_schema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    label: { type: String, required: true },
    state: [{ type: mongoose.Schema.Types.ObjectId, ref: "state_master" }],
  },
  { timestamps: true }
);

const Country = crm_connection.model("country_master", country_master_schema);

module.exports = Country;
