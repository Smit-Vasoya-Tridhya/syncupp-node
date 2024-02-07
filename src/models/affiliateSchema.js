const mongoose = require("mongoose");
const { crm_connection } = require("../config/connection");

const affiliateSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    company_name: { type: String, required: true },
    last_name: { type: String },
    first_name: { type: String },
    reset_password_token: { type: String },
    invitation_token: { type: String },
    is_deleted: { type: Boolean, default: false },
    remember_me: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Affiliate = crm_connection.model("affiliate", affiliateSchema);
module.exports = Affiliate;
