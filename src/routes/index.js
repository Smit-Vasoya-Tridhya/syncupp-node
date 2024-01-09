const router = require("express").Router();

const authRoute = require("./authRoute");
const adminRoute = require("./adminRoute");
const agencyRoute = require("./agencyRoute");
const clientRoute = require("./clientRoute");
const teamMemberRoute = require("./teamMemberRoute");

router.use("/api/v1/auth", authRoute);
router.use("/api/v1/admin", adminRoute);
router.use("/api/v1/agency", agencyRoute);
router.use("/api/v1/team-member", teamMemberRoute);
router.use("/api/v1/agency", agencyRoute);
router.use("/api/v1/client", clientRoute);

module.exports = router;
