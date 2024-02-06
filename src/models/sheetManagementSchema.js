const mongoose = require("mongoose");
const { crm_connection } = require("../config/connection");

const sheetManagementSchema = new mongoose.Schema(
  {
    agency_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "agency",
      unique: true,
    },
    total_sheets: { type: Number, default: 1 },
    occupied_sheets: [
      {
        user_id: { type: mongoose.Schema.Types.ObjectId, required: true },
        role: { type: String, required: true },
        date: { type: Date, default: new Date() },
      },
    ],
  },
  { timestamps: true }
);

const SheetManagement = crm_connection.model(
  "sheet_management",
  sheetManagementSchema
);
module.exports = SheetManagement;
