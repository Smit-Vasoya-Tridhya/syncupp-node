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
const { protect } = require("../middlewares/authMiddleware");

// this route is used for the ADMIN panel Login
adminRoute.post("/login", login);
adminRoute.post("/forgotPassword", forgotPassword);
adminRoute.post("/resetPassword", resetPassword);

// adminRoute.use(protect);

adminRoute.post("/updatePassword", changePassword);
// adminRoute.get("/getAdmins", getAdmins);

module.exports = adminRoute;
