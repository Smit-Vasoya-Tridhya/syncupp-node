const mongoose = require("mongoose");
const { admin_connection } = require("../config/connection");

const adminSchema = new mongoose.Schema({}, { timestamps: true });

const Admin = admin_connection.model("admin", adminSchema);
module.exports = Admin;
