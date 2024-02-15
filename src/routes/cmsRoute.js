const adminRoute = require("express").Router();
const validatorFunc = require("../utils/validatorFunction.helper");
const cmsController = require("../controllers/cmsController");
const { protect } = require("../middlewares/authAdminMiddleware");
const { validateCreateInquiry } = require("../validators/inquiry.validator");
const { upload } = require("../helpers/multer");
const {
  addTermAndCondition,
  getTermAndCondition,
  updateTermAndCondition,
} = require("../controllers/termAndConditionController");
// adminRoute.use(protect);

// Contact Us
adminRoute.put("/contact-us", cmsController.updateContactUs);
adminRoute.get("/contact-us", cmsController.getContactUs);

// Privacy Policy
adminRoute.put("/privacy-policy", cmsController.updatePrivacyPolicy);
adminRoute.get("/privacy-policy", cmsController.getPrivacyPolicy);

// Price Plan
adminRoute.put("/price-plan", cmsController.updatePricePlan);
adminRoute.get("/price-plan", cmsController.getPricePlan);

// technology Plan
adminRoute.put("/technology-stack", cmsController.updateTechnologyStack);
adminRoute.get("/technology-stack", cmsController.getTechnologyStack);

//term and condition
// adminRoute.post("/term-and-condition", addTermAndCondition);
adminRoute.get("/term-and-condition", getTermAndCondition);
adminRoute.put("/term-and-condition", updateTermAndCondition);

//About us
adminRoute.put("/about-us", cmsController.updateAboutUs);
adminRoute.get("/about-us", cmsController.getAboutUS);

module.exports = adminRoute;
