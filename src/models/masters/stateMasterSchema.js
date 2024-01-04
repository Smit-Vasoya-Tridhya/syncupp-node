const mongoose = require("mongoose");
const { crm_connection } = require("../../config/connection");

const state_master_schema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    label: { type: String, required: true },
    city: [{ type: mongoose.Schema.Types.ObjectId, ref: "city_master" }],
  },
  { timestamps: true }
);

const State = crm_connection.model("state_master", state_master_schema);

module.exports = State;
