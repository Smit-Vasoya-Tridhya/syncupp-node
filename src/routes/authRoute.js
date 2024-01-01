const authRoute = require("express").Router();
const { upload } = require("../helpers/multer");
const authController = require("../controllers/authController");

authRoute.post(
  "/signup",
  upload.fields([{ name: "agency_logo", maxCount: 1 }]),
  authController.agencySignUp
);

authRoute.post("/google-signup", authController.agencyGoogleSignUp);
authRoute.get("/facebook-signup", authController.agencyFacebookSignUp);

module.exports = authRoute;
