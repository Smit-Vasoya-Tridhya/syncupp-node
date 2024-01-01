const authRoute = require("express").Router();
const { upload } = require("../helpers/multer");
const authController = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");

authRoute.post("/signup", authController.agencySignUp);

authRoute.post("/google-signup", authController.agencyGoogleSignUp);
authRoute.get("/facebook-signup", authController.agencyFacebookSignUp);

// this will work for all type of the memebers
authRoute.post("/login", authController.login);
authRoute.post("/forgot-password", authController.forgotPassword);
authRoute.post("/reset-password", authController.resetPassword);

authRoute.use(protect);
authRoute.post("/change-password", authController.changePassword);

module.exports = authRoute;
