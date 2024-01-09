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
  getFaq,
} = require("../controllers/adminController");
const validatorFunc = require("../utils/validatorFunction.helper");
const agencyController = require("../controllers/agencyController");
const {
  resetPasswordValidator,
  loginAdminValidator,
  forgotPasswordValidator,
  updatePasswordValidator,
  deleteFaqValidator,
  addFaqValidator,
  updateFaqValidator,
} = require("../validators/admin.validator");
const { protect } = require("../middlewares/authAdminMiddleware");

// this route is used for the ADMIN panel Login
adminRoute.post("/login", login);
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
adminRoute.post("/add-faq", addFaqValidator, validatorFunc, addFaq);
adminRoute.get("/get-all-faq", getAllFaq);
adminRoute.delete("/delete-faq", deleteFaqValidator, validatorFunc, deleteFaq);
adminRoute.put("/update-faq/:id", updateFaqValidator, validatorFunc, updateFaq);
adminRoute.get("/get-faq/:id", getFaq);

adminRoute.post("/agencies", agencyController.getAllAgency);
adminRoute.patch("/update-agency", agencyController.updateAgency);
module.exports = adminRoute;
