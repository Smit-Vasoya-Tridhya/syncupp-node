const mongoose = require("mongoose");
const { crm_connection } = require("../config/connection");

const authenticationSchema = new mongoose.Schema(
  {
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String },
    contact_number: { type: Number },
    is_google_signup: { type: Boolean, default: false },
    is_facebook_signup: { type: Boolean, default: false },
    reset_password_token: { type: String },
    invitation_token: { type: String },
    remember_me: { type: Boolean, default: false },
    is_deleted: { type: Boolean, default: false },
    role: { type: mongoose.Types.ObjectId, ref: "role_master", required: true },
    reference_id: { type: mongoose.Types.ObjectId, required: true },
    image_url: { type: String },
    status: {
      type: String,
      enum: [
        "payment_pending",
        "payment_done",
        "confirmed",
        "confirm_pending",
        "agency_inactive",
      ],
    },
  },
  { timestamps: true }
);

const Authentication = crm_connection.model(
  "authentication",
  authenticationSchema
);

module.exports = Authentication;
