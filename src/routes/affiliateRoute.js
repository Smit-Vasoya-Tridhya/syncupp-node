const affiliateRoute = require("express").Router();
const validatorFunc = require("../utils/validatorFunction.helper");
const affiliateController = require("../controllers/affiliateController");
const { protect } = require("../middlewares/affiliateAdminMiddleware");

affiliateRoute.post("/login", affiliateController.login);
affiliateRoute.post("/signup", affiliateController.signUp);
affiliateRoute.post("/forgot-password", affiliateController.forgotPassword);
affiliateRoute.post("/reset-password", affiliateController.resetPassword);

affiliateRoute.use(protect);
affiliateRoute.post("/change-password", affiliateController.changePassword);

module.exports = affiliateRoute;
