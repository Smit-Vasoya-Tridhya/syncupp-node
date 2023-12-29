const adminRoute = require("express").Router();
const {
  login,
  forgotPassword,
  resetPassword,
  getAdmins,
} = require("../controllers/adminController");

// this route is used for the ADMIN panel Login
adminRoute.post("/login", login);
adminRoute.post("/forgotPassword", forgotPassword);
adminRoute.post("/resetPassword", resetPassword);
adminRoute.get("/getAdmins", getAdmins);

module.exports = adminRoute;
