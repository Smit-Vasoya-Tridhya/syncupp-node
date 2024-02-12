const adminRoute = require("express").Router();
const validatorFunc = require("../utils/validatorFunction.helper");
const cmsController = require("../controllers/cmsController");
const { protect } = require("../middlewares/authAdminMiddleware");
const { validateCreateInquiry } = require("../validators/inquiry.validator");

// adminRoute.use(protect);

adminRoute.post("/contact-us/add", cmsController.addContactUs);
adminRoute.get("/contact-us", cmsController.getContactUs);

adminRoute.post("/privacy-policy/add", cmsController.addPrivacyPolicy);
adminRoute.put("/privacy-policy/id", cmsController.addContactUs);
adminRoute.get("/privacy-policy", cmsController.getContactUs);
adminRoute.delete("/privacy-policy", cmsController.getContactUs);

module.exports = adminRoute;
