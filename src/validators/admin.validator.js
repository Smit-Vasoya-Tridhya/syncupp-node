const { body } = require("express-validator");
const validationMessage = require("../messages/valiation.json");
exports.resetPasswordValidator = [
  body("token")
    .not()
    .isEmpty()
    .withMessage(validationMessage.general.tokenRequired),
  body("email")
    .not()
    .isEmpty()
    .withMessage(validationMessage.general.emailRequired)
    .matches(
      /^([a-zA-Z0-9]+)([\-\_\.]*)([a-zA-Z0-9]*)([@])([a-zA-Z0-9]{2,})([\.][a-zA-Z]{2,3})$/
    )
    .withMessage(validationMessage.general.invalidEmail)
    .trim(),
  body("newPassword")
    .not()
    .isEmpty()
    .withMessage(validationMessage.general.passwordRequired)
    .trim()
    .isLength({ min: 6 })
    .matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$.!%*#?&])[A-Za-z\d@$.!%*#?&]{6,}$/)
    .withMessage(validationMessage.general.invalidPassword),
];

exports.loginAdminValidator = [
  body("email")
    .not()
    .isEmpty()
    .withMessage(validationMessage.general.emailRequired)
    .matches(
      /^([a-zA-Z0-9]+)([\-\_\.]*)([a-zA-Z0-9]*)([@])([a-zA-Z0-9]{2,})([\.][a-zA-Z]{2,3})$/
    )
    .withMessage(validationMessage.general.invalidEmail)
    .trim(),
  body("password")
    .not()
    .isEmpty()
    .withMessage(validationMessage.general.passwordRequired)
    .trim()
    .isLength({ min: 6 })
    .matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$.!%*#?&])[A-Za-z\d@$.!%*#?&]{6,}$/)
    .withMessage(validationMessage.general.invalidPassword),
];

exports.forgotPasswordValidator = [
  body("email")
    .not()
    .isEmpty()
    .withMessage(validationMessage.general.emailRequired)
    .matches(
      /^([a-zA-Z0-9]+)([\-\_\.]*)([a-zA-Z0-9]*)([@])([a-zA-Z0-9]{2,})([\.][a-zA-Z]{2,3})$/
    )
    .withMessage(validationMessage.general.invalidEmail)
    .trim(),
];
exports.updatePasswordValidator = [
  body("oldPassword")
    .not()
    .isEmpty()
    .withMessage(validationMessage.general.passwordRequired)
    .trim()
    .isLength({ min: 6 })
    .matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$.!%*#?&])[A-Za-z\d@$.!%*#?&]{6,}$/)
    .withMessage(validationMessage.general.invalidPassword),
  body("newPassword")
    .not()
    .isEmpty()
    .withMessage(validationMessage.general.passwordRequired)
    .trim()
    .isLength({ min: 6 })
    .matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$.!%*#?&])[A-Za-z\d@$.!%*#?&]{6,}$/)
    .withMessage(validationMessage.general.invalidPassword),
];
