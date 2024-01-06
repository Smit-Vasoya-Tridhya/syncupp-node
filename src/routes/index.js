const router = require("express").Router();

const authRoute = require("./authRoute");
const adminRoute = require("./adminRoute");
const agencyRoute = require("./agencyRoute");
const clientRoute = require("./clientRoute");

router.use("/api/v1/auth", authRoute);
router.use("/api/v1/admin", adminRoute);

//
//
router.use("/api/v1/agency", agencyRoute);
router.use("/api/v1/client", clientRoute);

module.exports = router;
