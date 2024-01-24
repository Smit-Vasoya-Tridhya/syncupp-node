const { protect, authorizeRole } = require("../middlewares/authMiddleware");
const invoiceRoute = require("express").Router();
const invoiceController = require("../controllers/invoiceController");
const { validateCreateInvoice } = require("../validators/invoice.validator");
const validatorFunc = require("../utils/validatorFunction.helper");

invoiceRoute.use(protect);

invoiceRoute.get("/agency/invoice/get-clients", invoiceController.getClients);
invoiceRoute.get(
  "/agency/invoice/get-invoice-data/:id",
  invoiceController.getInvoiceInformation
);
invoiceRoute.post(
  "/agency/invoice/create-invoice",
  invoiceController.addInvoice
);
invoiceRoute.post("/agency/invoice/get-all", invoiceController.getAllInvoice);
invoiceRoute.post(
  "/client/invoice/get-all",
  invoiceController.getClientInvoice
);
invoiceRoute.get("/agency/invoice/:id", invoiceController.getInvoice);
invoiceRoute.get("/client/invoice/:id", invoiceController.getInvoice);
invoiceRoute.delete("/agency/invoice/:id", invoiceController.deleteInvoice);
invoiceRoute.put("/agency/invoice/:id", invoiceController.updateStatusInvoice);
module.exports = invoiceRoute;
