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
const agencyController = require("../controllers/agencyController");
const {
  resetPasswordValidator,
  loginAdminValidator,
  forgotPasswordValidator,
  updatePasswordValidator,
} = require("../validators/admin.validator");
const { protect } = require("../middlewares/authAdminMiddleware");
const {
  addFaq,
  getAllFaq,
  deleteFaq,
  updateFaq,
  getFaq,
} = require("../controllers/faqController");
const {
  deleteFaqValidator,
  updateFaqValidator,
  addFaqValidator,
} = require("../validators/faq.validator");

//coupon code start
const {
  deleteCouponValidator,
  updateCouponValidator,
  addCouponValidator,
} = require("../validators/coupon.validator");

const {
  addCoupon,
  deleteCoupon,
  updateCoupon,
  getCoupon,
} = require("../controllers/couponController");
//coupon code end


const { addCoupon } = require("../controllers/couponController");

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
adminRoute.get("/getProfile", getAdmin);
adminRoute.put("/updateProfile", updateAdmin);
adminRoute.post("/add-faq", addFaqValidator, validatorFunc, addFaq);
adminRoute.post("/get-all-faq", getAllFaq);
adminRoute.delete("/delete-faq", deleteFaqValidator, validatorFunc, deleteFaq);
adminRoute.put("/update-faq/:id", updateFaqValidator, validatorFunc, updateFaq);
adminRoute.get("/get-faq/:id", getFaq);

adminRoute.post("/agencies", agencyController.getAllAgency);
adminRoute.patch("/update-agency", agencyController.updateAgency);

adminRoute.post("/add-coupon", addCouponValidator, validatorFunc, addCoupon);
adminRoute.get("/get-coupon/:id", getCoupon);
adminRoute.put("/update-coupon/:id", updateCouponValidator, validatorFunc, updateCoupon);
adminRoute.delete("/delete-coupon", deleteCouponValidator, validatorFunc, deleteFaq);

module.exports = adminRoute;
