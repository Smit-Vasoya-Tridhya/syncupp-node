const { body } = require("express-validator");
const validationMessage = require("../messages/valiation.json");

exports.validateCreateInquiry = [
  body("name").notEmpty().withMessage(validationMessage.inquiry.nameRequired),
  body("message")
    .notEmpty()
    .withMessage(validationMessage.inquiry.messageRequired),

  body("contact_number")
    .notEmpty()
    .withMessage(validationMessage.inquiry.contactNumberRequired),

  body("email")
    .notEmpty()
    .withMessage(validationMessage.inquiry.emailRequired)
    .isEmail()
    .withMessage(validationMessage.inquiry.emailInvalid),
];
