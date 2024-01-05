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
exports.createFaqValidator = [
  body("question")
    .not()
    .isEmpty()
    .withMessage(validationMessage.general.questionRequired)
    .isLength({ max: 100 }) // specify the maximum length for the question
    .withMessage(validationMessage.general.questionLength),
  body("answer")
    .not()
    .isEmpty()
    .withMessage(validationMessage.general.answerRequired)
    .isLength({ max: 1000 }) // specify the maximum length for the answer
    .withMessage(validationMessage.general.answerLength),
];
