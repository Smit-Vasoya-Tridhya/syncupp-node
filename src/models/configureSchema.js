const mongoose = require("mongoose");
const { crm_connection } = require("../config/connection");
const configureSchema = new mongoose.Schema(
  {
    subscription_plan: {
      name: { type: String, required: true },
      period: { type: String, default: "monthly", enum: ["monthly", "yearly"] },
      amount: { type: Number, required: true },
      description: { type: String },
      currency: { type: String, required: true },
      plan_id: { type: String, required: true },
      active: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);
const Configuration = crm_connection.model("configuration", configureSchema);
module.exports = Configuration;
