const {
  register,
  verify,
  login,
  forgotPassword,
  resetPassword,
  updatePassword,
} = require("../controllers/teamAgencyController");
const validatorFunc = require("../utils/validatorFunction.helper");
const {
  resetPasswordValidator,
  forgotPasswordValidator,
  loginTeamMemberValidator,
  verifyValidator,
  registerMemberValidator,
} = require("../validators/teamAgency.validator");

const teamAgencyRoute = require("express").Router();

// this route is used for the Team Agency Route.
teamAgencyRoute.post(
  "/register",
  registerMemberValidator,
  validatorFunc,
  register
);
teamAgencyRoute.post("/verify", verifyValidator, validatorFunc, verify);
teamAgencyRoute.post("/login", loginTeamMemberValidator, validatorFunc, login);
teamAgencyRoute.post(
  "/forgotpassword",
  forgotPasswordValidator,
  validatorFunc,
  forgotPassword
);
teamAgencyRoute.post(
  "/resetPassword",
  resetPasswordValidator,
  validatorFunc,
  resetPassword
);
teamAgencyRoute.post("/updatePassword", updatePassword);

module.exports = teamAgencyRoute;
