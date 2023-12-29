const adminRoute = require("express").Router();
const {
  login,
  forgotPassword,
  resetPassword,
  getAdmins,
  updatePassword,
} = require("../controllers/adminController");
const validatorFunc = require("../utils/validatorFunction.helper");
const { resetPasswordValidator } = require("../validators/admin.validator");

// this route is used for the ADMIN panel Login
adminRoute.post("/login", login);
adminRoute.post("/forgotPassword", forgotPassword);
adminRoute.post(
  "/resetPassword",
  resetPasswordValidator,
  validatorFunc,
  resetPassword
);
adminRoute.post("/updatePassword", updatePassword);
adminRoute.get("/getAdmins", getAdmins);

module.exports = adminRoute;
