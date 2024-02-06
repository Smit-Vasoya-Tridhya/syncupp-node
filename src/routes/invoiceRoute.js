const { protect, authorizeRole } = require("../middlewares/authMiddleware");
const invoiceRoute = require("express").Router();
const invoiceController = require("../controllers/invoiceController");
const { validateCreateInvoice } = require("../validators/invoice.validator");
const validatorFunc = require("../utils/validatorFunction.helper");

invoiceRoute.use(protect);

invoiceRoute.get("/get-clients", invoiceController.getClients);
invoiceRoute.post("/get-invoice-data", invoiceController.getInvoiceInformation);
invoiceRoute.post(
  "/create-invoice",
  validateCreateInvoice,
  validatorFunc,
  invoiceController.addInvoice
);
invoiceRoute.post("/get-all", invoiceController.getAllInvoice);
invoiceRoute.get("/:id", invoiceController.getInvoice);
invoiceRoute.delete("/delete-invoice", invoiceController.deleteInvoice);
invoiceRoute.put("/:id", invoiceController.updateInvoice);
invoiceRoute.put("/status-update/:id", invoiceController.updateStatusInvoice);
invoiceRoute.post("/send-invoice", invoiceController.sendInvoice);
invoiceRoute.post("/download-invoice", invoiceController.downloadPdf);

module.exports = invoiceRoute;
