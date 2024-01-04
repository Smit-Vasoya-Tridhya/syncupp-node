const mongoose = require("mongoose");
const { crm_connection } = require("../config/connection");

const teamClientSchema = new mongoose.Schema(
  {
    client_id: {
      type: mongoose.Types.ObjectId,
      ref: "client",
      required: true,
    },
    role: {
      type: mongoose.Types.ObjectId,
      ref: "team_role_master",
      required: true,
    },
  },
  { timestamps: true }
);

const Team_Client = crm_connection.model("team_client", teamClientSchema);
module.exports = Team_Client;
