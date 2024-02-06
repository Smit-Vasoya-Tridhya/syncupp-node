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
const {
  addTermAndCondition,
} = require("../controllers/termAndConditionController");
const {
  addTermAndConditionValidator,
} = require("../validators/termAndCondition.validator");
const {
  addClientReview,
  getAllClientReview,
  deleteClientReview,
  updateClientReview,
  getClientReviewByID,
} = require("../controllers/adminClientReviewController");
const {
  addClientReviewValidator,
  deleteClientReviewValidator,
  updateClientReviewValidator,
} = require("../validators/clientReview.validator");
const { upload } = require("../helpers/multer");

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
adminRoute.post(
  "/add-term-and-condition",
  addTermAndConditionValidator,
  validatorFunc,
  addTermAndCondition
);
// Client Review APIs
adminRoute.get("/get-client-review/:id", getClientReviewByID);
adminRoute.post("/get-client-review", getAllClientReview);
adminRoute.post(
  "/add-client-review",
  // addClientReviewValidator,
  // validatorFunc,
  upload.single("client_review_image"),
  addClientReview
);
adminRoute.put(
  "/update-client-review/:id",
  // updateClientReviewValidator,
  // validatorFunc,
  upload.single("client_review_image"),
  updateClientReview
);
adminRoute.delete(
  "/delete-client-review",
  deleteClientReviewValidator,
  validatorFunc,
  deleteClientReview
);

adminRoute.post("/agencies", agencyController.getAllAgency);
adminRoute.patch("/update-agency", agencyController.updateAgency);
module.exports = adminRoute;
