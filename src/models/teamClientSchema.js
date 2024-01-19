const mongoose = require("mongoose");
const { crm_connection } = require("../config/connection");

const teamClientSchema = new mongoose.Schema(
  {
    client_id: {
      type: mongoose.Types.ObjectId,
      ref: "client",
      required: true,
    },

    agency_ids: [
      {
        type: mongoose.Types.ObjectId,
        ref: "agency",
      },
    ],
    role: {
      type: mongoose.Types.ObjectId,
      ref: "team_role_master",
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Team_Client = crm_connection.model("team_client", teamClientSchema);
module.exports = Team_Client;
