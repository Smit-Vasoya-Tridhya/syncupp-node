const { protect, authorizeRole } = require("../middlewares/authMiddleware");
const referralController = require("../controllers/referralController");
const referralRoute = require("express").Router();
referralRoute.use(protect);
referralRoute.get("/check-referral", referralController.checkRefferal);

module.exports = referralRoute;
