const mongoose = require("mongoose");
const { crm_connection } = require("../../config/connection");

const agencyTypeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    label: { type: String, required: true },
  },
  { timestamps: true }
);

const Agency_Type_Master = crm_connection.model(
  "agency_type_master",
  agencyTypeSchema
);

module.exports = Agency_Type_Master;
