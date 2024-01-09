const { protect, authorizeRole } = require("../middlewares/authMiddleware");
const clientController = require("../controllers/clientController");
const agencyRoute = require("express").Router();
const {
  getAgencyProfile,
  updateAgencyProfile,
} = require("../controllers/agencyController");
const agreementController = require("../controllers/agreementController");
const { upload } = require("../helpers/multer");
const agreementValidator = require("../validators/agreement.validator");
const validatorFunc = require("../utils/validatorFunction.helper");

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
