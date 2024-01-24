const { protect, authorizeRole } = require("../middlewares/authMiddleware");
const clientController = require("../controllers/clientController");
const agencyRoute = require("express").Router();
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

agencyRoute.get(
  "/get-client/:clientId",
  authorizeRole("agency"),
  agencyController.getClient
);

agencyRoute.patch(
  "/update-client/:clientId",
  authorizeRole("agency"),
  agencyController.updateClient
);

agencyRoute.post("/clients", authorizeRole("agency"), clientController.clients);
agencyRoute.get("/get-profile", agencyController.getAgencyProfile);
agencyRoute.put("/update-profile", agencyController.updateAgencyProfile);

module.exports = agencyRoute;
