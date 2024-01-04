const mongoose = require("mongoose");
const { crm_connection } = require("../../config/connection");

const city_master_schema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    label: { type: String, required: true },
  },
  { timestamps: true }
);

const City = crm_connection.model("city_master", city_master_schema);

module.exports = City;
