const mongoose = require("mongoose");
const { crm_connection } = require("../config/connection");

const paymentHistorySchema = new mongoose.Schema(
  {
    agency_id: { type: mongoose.Schema.Types.ObjectId, ref: "Agency" },
    user_id: { type: mongoose.Schema.Types.ObjectId },
    role: { type: String },
    subscription_id: { type: String },
    order_id: { type: String },
    amount: { type: Number },
    currency: { type: String, required: true },
  },
  { timestamps: true }
);

const PaymentHistory = crm_connection.model(
  "payment_history",
  paymentHistorySchema
);

module.exports = PaymentHistory;
