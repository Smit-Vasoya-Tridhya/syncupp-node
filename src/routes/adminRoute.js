const adminRoute = require("express").Router();
const {
  login,
  forgotPassword,
  resetPassword,
  changePassword,
  getAdmin,
  updateAdmin,
} = require("../controllers/adminController");
const validatorFunc = require("../utils/validatorFunction.helper");
const {
  resetPasswordValidator,
  loginAdminValidator,
  forgotPasswordValidator,
  updatePasswordValidator,
} = require("../validators/admin.validator");
const { protect } = require("../middlewares/authAdminMiddleware");

// this route is used for the ADMIN panel Login
adminRoute.post("/login", loginAdminValidator, validatorFunc, login);
adminRoute.post(
  "/forgotPassword",
  forgotPasswordValidator,
  validatorFunc,
  forgotPassword
);
adminRoute.post(
  "/resetPassword",
  resetPasswordValidator,
  validatorFunc,
  resetPassword
);

adminRoute.use(protect);

adminRoute.put(
  "/updatePassword",
  updatePasswordValidator,
  validatorFunc,
  changePassword
);
adminRoute.get("/details", getAdmin);
adminRoute.put("/updateProfile", updateAdmin);

module.exports = adminRoute;
