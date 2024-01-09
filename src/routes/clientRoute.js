const clientRoute = require("express").Router();
const { protect, authorizeRole } = require("../middlewares/authMiddleware");
const clientController = require("../controllers/clientController");
const agreementController = require("../controllers/agreementController");

clientRoute.post("/verify-client", clientController.verifyClient);
clientRoute.use(protect);

clientRoute.get("/", authorizeRole("client"), clientController.getClient);
clientRoute.patch(
  "/update",
  authorizeRole("client"),
  clientController.updateClient
);

// Agreement

clientRoute.post(
  "/get-all-agreement",
  agreementController.getAllClientAgreement
);
clientRoute.get("/get-agreement/:id", agreementController.getAgreement);

clientRoute.put(
  "/update-agreement/:id",
  agreementController.updateAgreementStatus
);
module.exports = clientRoute;
