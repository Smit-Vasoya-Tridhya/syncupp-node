const { protect, authorizeRole } = require("../middlewares/authMiddleware");
const clientController = require("../controllers/clientController");
const agencyRoute = require("express").Router();

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
module.exports = agencyRoute;
