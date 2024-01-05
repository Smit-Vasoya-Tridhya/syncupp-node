const router = require("express").Router();

const userRoute = require("./userRoute");
const authRoute = require("./authRoute");
const adminRoute = require("./adminRoute");
const teamMemberRoute = require("./teamMemberRoute");

router.use("/api/v1/user", userRoute);
router.use("/api/v1/auth", authRoute);
router.use("/api/v1/admin", adminRoute);
router.use("/api/v1/team-member", teamMemberRoute);

module.exports = router;
