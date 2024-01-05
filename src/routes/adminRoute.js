const adminRoute = require("express").Router();
const {
  login,
  forgotPassword,
  resetPassword,
  changePassword,
  getAdmin,
  updateAdmin,
  addFaq,
  getAllFaq,
  deleteFaq,
  updateFaq,
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
adminRoute.post("/login", login);
adminRoute.post("/forgotPassword", forgotPassword);
adminRoute.get("/getAdmins", getAdmin);
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
adminRoute.post("/add-faq", addFaq);
adminRoute.get("/get-all-faq", getAllFaq);
adminRoute.delete("/delete-faq", deleteFaq);
adminRoute.put("/update-faq/:id", updateFaq);

module.exports = adminRoute;
