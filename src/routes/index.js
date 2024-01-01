const router = require("express").Router();

const userRoute = require("./userRoute");
const authRoute = require("./authRoute");
const adminRoute = require("./adminRoute");
const teamAgencyRoute = require("./teamAgencyRoute");

router.use("/api/v1/user", userRoute);
router.use("/api/v1/auth", authRoute);
router.use("/api/v1/admin", adminRoute);
router.use("/api/v1/teamAgency", teamAgencyRoute);

module.exports = router;
