const { protect, authorizeRole } = require("../middlewares/authMiddleware");
const clientController = require("../controllers/clientController");
const agencyRoute = require("express").Router();
const {
  getAgencyProfile,
  updateAgencyProfile,
} = require("../controllers/agencyController");
const agencyController = require("../controllers/agencyController");

agencyRoute.use(protect);
agencyRoute.post(
  "/create-client",
  authorizeRole("agency"),
  clientController.createClient
);
agencyRoute.delete(
  "/delete-client",
  authorizeRole("agency"),
  clientController.deleteClient
);

agencyRoute.patch(
  "/update-client/:clientId",
  authorizeRole("agency"),
  agencyController.updateClient
);

agencyRoute.post("/clients", authorizeRole("agency"), clientController.clients);

agencyRoute.get("/get-profile", getAgencyProfile);
agencyRoute.put("/update-profile", updateAgencyProfile);

module.exports = agencyRoute;
