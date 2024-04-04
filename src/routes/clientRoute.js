const clientRoute = require("express").Router();
const { protect, authorizeRole } = require("../middlewares/authMiddleware");
const clientController = require("../controllers/clientController");

clientRoute.post("/verify-client", clientController.verifyClient);
clientRoute.use(protect);

clientRoute.get("/", authorizeRole("client"), clientController.getClient);
clientRoute.patch(
  "/update",
  authorizeRole("client"),
  clientController.updateClient
);

// Get Agencies

clientRoute.get("/get-agencies", clientController.getAgencies);

module.exports = clientRoute;
