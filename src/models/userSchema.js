const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({}, { timeseries: true });

const User = mongoose.model("User", userSchema);

module.exports = User;
