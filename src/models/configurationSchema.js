const mongoose = require("mongoose");
const { crm_connection } = require("../config/connection");

const configurationSchema = new mongoose.Schema(
  {
    referral_point: { type: Number, default: 500 },
    point_required: { type: Number, default: 2000 },
  },
  { timestamps: true }
);

const Configuration = crm_connection.model(
  "configuration",
  configurationSchema
);
module.exports = Configuration;
