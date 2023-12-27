const router = require("express").Router();

const userRoute = require("./userRoute");
const authRoute = require("./authRoute");

router.use("/api/v1/user", userRoute);
router.use("/api/v1/auth", authRoute);

module.exports = router;
