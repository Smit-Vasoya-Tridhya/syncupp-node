const { protect, authorizeRole } = require("../middlewares/authMiddleware");
const clientController = require("../controllers/clientController");
const agencyRoute = require("express").Router();
const {
  getAgencyProfile,
  updateAgencyProfile,
} = require("../controllers/agencyController");
const { upload } = require("../helpers/multer");
const { protect } = require("../middlewares/authMiddleware");

agencyRoute.use(protect);
agencyRoute.post(
  "/create-client",
  authorizeRole("agency"),
  clientController.createClient
);
agencyRoute.delete(
  "/delete-client/:clientId",
  authorizeRole("agency"),
  clientController.deleteClient
);

agencyRoute.post("/clients", authorizeRole("agency"), clientController.clients);

agencyRoute.get("/get-profile", getAgencyProfile);
agencyRoute.put("/update-profile", updateAgencyProfile);

module.exports = agencyRoute;
