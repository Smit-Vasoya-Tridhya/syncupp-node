const { protect, authorizeRole } = require("../middlewares/authMiddleware");
const agreementRoute = require("express").Router();
const agreementController = require("../controllers/agreementController");
const agreementValidator = require("../validators/agreement.validator");
const validatorFunc = require("../utils/validatorFunction.helper");

agreementRoute.use(protect);

// Agency Agreement API
agreementRoute.post(
  "/agency/agreement/add-agreement",
  agreementValidator.addAgreementValidator,
  validatorFunc,
  agreementController.addAgreement
);
agreementRoute.post(
  "/agency/agreement/get-all-agreement",
  agreementController.getAllAgreement
);
agreementRoute.get(
  "/agency/agreement/get-agreement/:id",
  agreementController.getAgreement
);
agreementRoute.post(
  "/agency/agreement/delete-agreement",
  agreementController.deleteAgreement
);
agreementRoute.put(
  "/agency/agreement/update-agreement/:id",
  agreementValidator.updateAgreementValidator,
  validatorFunc,
  agreementController.updateAgreement
);
agreementRoute.post(
  "/agency/agreement/send-agreement",
  agreementController.sendAgreement
);
agreementRoute.get(
  "/agency/agreement/download-pdf/:id",
  agreementController.downloadPdf
);

// Client Agreement API

agreementRoute.post(
  "/client/agreement/get-all-agreement",
  agreementController.getAllClientAgreement
);
agreementRoute.get(
  "/client/agreement/get-agreement/:id",
  agreementController.getAgreement
);

agreementRoute.put(
  "/client/agreement/update-agreement-status/{id}",
  agreementController.updateAgreementStatus
);

module.exports = agreementRoute;
