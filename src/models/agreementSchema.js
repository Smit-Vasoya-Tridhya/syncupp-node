const mongoose = require("mongoose");
const { admin_connection, crm_connection } = require("../config/connection");

const agreementSchema = new mongoose.Schema(
  {
    client_id: {
      type: mongoose.Types.ObjectId,
      ref: "authentication",
      required: true,
    },
    agency_id: {
      type: mongoose.Types.ObjectId,
      ref: "authentication",
      required: true,
    },
    due_date: {
      type: Date,
      required: true,
    },

    title: {
      type: String,
      required: true,
    },
    receiver: {
      type: String,
      required: true,
    },
    agreement_content: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["draft", "sent", "agreed"],
      required: true,
    },
    is_deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Agreement = crm_connection.model("agreement", agreementSchema);
module.exports = Agreement;
