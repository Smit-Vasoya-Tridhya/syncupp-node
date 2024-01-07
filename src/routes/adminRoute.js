const adminRoute = require("express").Router();
const {
  login,
  forgotPassword,
  resetPassword,
  getAdmins,
  changePassword,
} = require("../controllers/adminController");
const validatorFunc = require("../utils/validatorFunction.helper");
const { resetPasswordValidator } = require("../validators/admin.validator");
const agencyController = require("../controllers/agencyController");

// this route is used for the ADMIN panel Login
adminRoute.post("/login", login);
adminRoute.post("/forgotPassword", forgotPassword);
adminRoute.post("/resetPassword", resetPassword);
adminRoute.post("/updatePassword", changePassword);
adminRoute.get("/getAdmins", getAdmins);

adminRoute.post("/agencies", agencyController.getAllAgency);
adminRoute.patch("/update-agency", agencyController.updateAgency);
module.exports = adminRoute;
