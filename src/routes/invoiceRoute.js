const { protect, authorizeRole } = require("../middlewares/authMiddleware");
const invoiceRoute = require("express").Router();
const invoiceController = require("../controllers/invoiceController");
const { validateCreateInvoice } = require("../validators/invoice.validator");
const validatorFunc = require("../utils/validatorFunction.helper");

invoiceRoute.use(protect);

invoiceRoute.get("/get-clients", invoiceController.getClients);
invoiceRoute.post("/get-invoice-data", invoiceController.getInvoiceInformation);
invoiceRoute.post("/create-invoice", invoiceController.addInvoice);
invoiceRoute.post("/get-all", invoiceController.getAllInvoice);
invoiceRoute.get("/:id", invoiceController.getInvoice);
invoiceRoute.delete("/:id", invoiceController.deleteInvoice);
module.exports = invoiceRoute;
