const { body } = require("express-validator");
const validationMessage = require("../messages/valiation.json");

exports.validateAffiliateRegistration = [
  body("email").notEmpty().withMessage(validationMessage.admin.emailRequired),
  body("password")
    .notEmpty()
    .withMessage(validationMessage.admin.passwordRequired),
  body("company_name")
    .notEmpty()
    .withMessage(validationMessage.admin.companyNameRequired),

  body("name").notEmpty().withMessage(validationMessage.admin.nameRequired),
];

exports.validateAffiliateLogin = [
  body("email").notEmpty().withMessage(validationMessage.admin.emailRequired),
  body("password")
    .notEmpty()
    .withMessage(validationMessage.admin.passwordRequired),
];

exports.validateAffiliateResetPassword = [
  body("email").notEmpty().withMessage(validationMessage.admin.emailRequired),
  body("token").notEmpty().withMessage(validationMessage.admin.tokenRequired),
  body("new_password")
    .notEmpty()
    .withMessage(validationMessage.general.newPassRequired),
];
