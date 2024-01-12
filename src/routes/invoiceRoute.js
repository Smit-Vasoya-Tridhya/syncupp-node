const { protect, authorizeRole } = require("../middlewares/authMiddleware");
const invoiceRoute = require("express").Router();
const invoiceController = require("../controllers/invoiceController");
const { validateCreateInvoice } = require("../validators/invoice.validator");
const validatorFunc = require("../utils/validatorFunction.helper");

invoiceRoute.use(protect);

invoiceRoute.get("/get-clients", invoiceController.getClients);
invoiceRoute.post("/create-invoice", invoiceController.addInvoice);
module.exports = invoiceRoute;
