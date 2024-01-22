const { protect, authorizeRole } = require("../middlewares/authMiddleware");
const clientController = require("../controllers/clientController");
const agencyRoute = require("express").Router();
const agreementController = require("../controllers/agreementController");
const agreementValidator = require("../validators/agreement.validator");
const validatorFunc = require("../utils/validatorFunction.helper");
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

// Agreement
agencyRoute.post(
  "/add-agreement",
  agreementValidator.addAgreementValidator,
  validatorFunc,
  agreementController.addAgreement
);
agencyRoute.post("/get-all-agreement", agreementController.getAllAgreement);
agencyRoute.get("/get-agreement/:id", agreementController.getAgreement);
agencyRoute.delete(
  "/delete-agreement/:id",
  agreementController.deleteAgreement
);
agencyRoute.put(
  "/update-agreement/:id",
  agreementValidator.updateAgreementValidator,
  validatorFunc,
  agreementController.updateAgreement
);

module.exports = agencyRoute;
