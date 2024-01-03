const router = require("express").Router();

const userRoute = require("./userRoute");
const authRoute = require("./authRoute");
const adminRoute = require("./adminRoute");

router.use("/api/v1/user", userRoute);
router.use("/api/v1/auth", authRoute);
router.use("/api/v1/admin", adminRoute);

module.exports = router;
