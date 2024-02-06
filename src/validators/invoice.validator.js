const { body } = require("express-validator");
const validationMessage = require("../messages/valiation.json");

exports.validateCreateInvoice = [
  body("invoice_number")
    .notEmpty()
    .withMessage(validationMessage.invoice.invoiceNumberRequired)
    .isString()
    .withMessage(validationMessage.invoice.invoiceNumberString),

  body("client_id")
    .notEmpty()
    .withMessage(validationMessage.invoice.clientIdRequired)
    .isMongoId()
    .withMessage(validationMessage.invoice.clientIdInvalid),

  body("due_date")
    .notEmpty()
    .withMessage(validationMessage.invoice.dueDateRequired)
    .isISO8601()
    .toDate()
    .withMessage(validationMessage.invoice.dueDateInvalid),

  body("invoice_date")
    .notEmpty()
    .withMessage(validationMessage.invoice.invoiceDateRequired)
    .isISO8601()
    .toDate()
    .withMessage(validationMessage.invoice.invoiceDateInvalid),

  body("invoice_content")
    .notEmpty()
    .withMessage(validationMessage.invoice.invoiceContentRequired)
    .isArray()
    .withMessage(validationMessage.invoice.invoiceContentArray),

  body("invoice_content.*.item")
    .notEmpty()
    .withMessage(validationMessage.invoice.itemRequired),

  body("invoice_content.*.qty")
    .notEmpty()
    .withMessage(validationMessage.invoice.qtyRequired)
    .isNumeric()
    .withMessage(validationMessage.invoice.qtyNumeric),

  body("invoice_content.*.rate")
    .notEmpty()
    .withMessage(validationMessage.invoice.rateRequired)
    .isNumeric()
    .withMessage(validationMessage.invoice.rateNumeric),

  body("invoice_content.*.tax")
    .notEmpty()
    .withMessage(validationMessage.invoice.taxRequired)
    .isNumeric()
    .withMessage(validationMessage.invoice.taxNumeric),

  body("invoice_content.*.amount")
    .notEmpty()
    .withMessage(validationMessage.invoice.amountRequired)
    .isNumeric()
    .withMessage(validationMessage.invoice.amountNumeric),

  body("invoice_content.*.description")
    .notEmpty()
    .withMessage(validationMessage.invoice.descriptionRequired),
];
