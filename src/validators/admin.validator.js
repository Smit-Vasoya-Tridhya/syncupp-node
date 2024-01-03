const { body } = require("express-validator");
const validationMessage = require("../messages/valiation.json");
exports.resetPasswordValidator = [
  body("token")
    .not()
    .isEmpty()
    .withMessage(validationMessage.admin.tokenRequired),
  body("email")
    .not()
    .isEmpty()
    .withMessage(validationMessage.admin.emailRequired)
    .matches(
      /^([a-zA-Z0-9]+)([\-\_\.]*)([a-zA-Z0-9]*)([@])([a-zA-Z0-9]{2,})([\.][a-zA-Z]{2,3})$/
    )
    .withMessage(validationMessage.admin.invalidEmail)
    .trim(),
  body("newPassword")
    .not()
    .isEmpty()
    .withMessage(validationMessage.admin.passwordRequired)
    .trim()
    .isLength({ min: 6 })
    .matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$.!%*#?&])[A-Za-z\d@$.!%*#?&]{6,}$/)
    .withMessage(validationMessage.admin.invalidPassword),
];
