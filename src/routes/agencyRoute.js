const agencyRoute = require("express").Router();
const {
  getAgencyProfile,
  updateAgencyProfile,
} = require("../controllers/agencyController");
const { upload } = require("../helpers/multer");
const { protect } = require("../middlewares/authMiddleware");

agencyRoute.use(protect);
agencyRoute.get("/get-profile", getAgencyProfile);
agencyRoute.put("/update-profile", updateAgencyProfile);

module.exports = agencyRoute;
