const { protect, authorizeRole } = require("../middlewares/authMiddleware");
const clientController = require("../controllers/clientController");
const agencyRoute = require("express").Router();
const agencyController = require("../controllers/agencyController");

agencyRoute.use(protect);
agencyRoute.post(
  "/create-client",
  // authorizeRole("agency"),// removed because to give access of team agency of type admin
  clientController.createClient
);
agencyRoute.delete(
  "/delete-client",
  // authorizeRole("agency"), // removed because to give access of team agency of type admin
  clientController.deleteClient
);

agencyRoute.get(
  "/get-client/:clientId",
  // authorizeRole("agency"),// removed because to give access of team agency of type admin
  agencyController.getClient
);

agencyRoute.patch(
  "/update-client/:clientId",
  // authorizeRole("agency"),// removed because to give access of team agency of type admin
  agencyController.updateClient
);

agencyRoute.post("/clients", clientController.clients);
agencyRoute.get("/get-profile", agencyController.getAgencyProfile);
agencyRoute.put("/update-profile", agencyController.updateAgencyProfile);
agencyRoute.get("/affiliate-data", agencyController.getAffiliateData);

module.exports = agencyRoute;
