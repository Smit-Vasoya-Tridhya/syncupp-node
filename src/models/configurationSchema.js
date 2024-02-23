const mongoose = require("mongoose");
const { crm_connection } = require("../config/connection");

const configurationSchema = new mongoose.Schema(
  {
    referral: {
      successful_referral_point: { type: Number, default: 500 },
      redeem_required_point: { type: Number, default: 2000 },
    },
  },
  { timestamps: true }
);

const Configuration = crm_connection.model(
  "configuration",
  configurationSchema
);
module.exports = Configuration;
