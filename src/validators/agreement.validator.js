const { body } = require("express-validator");
const validationMessage = require("../messages/valiation.json");

exports.addAgreementValidator = [
  body("client_id")
    .not()
    .isEmpty()
    .withMessage(validationMessage.agreement.clientIdReuired),
  body("title")
    .not()
    .isEmpty()
    .withMessage(validationMessage.agreement.titleRequired)
    .isLength({ max: 100 }) // specify the maximum length for the question
    .withMessage(validationMessage.general.titleLength),
  body("receiver").not().isEmpty().withMessage("Receiver name required"),
  body("agreement_content")
    .not()
    .isEmpty()
    .withMessage(validationMessage.agreement.descRequired)
    .isLength({ max: 1000 }) // specify the maximum length for the answer
    .withMessage(validationMessage.general.descLength),
  body("status")
    .not()
    .isEmpty()
    .withMessage(validationMessage.agreement.statusRequired),
  body("due_date")
    .not()
    .isEmpty()
    .withMessage(validationMessage.general.dateRequired),
];
exports.updateAgreementValidator = [
  body("title")
    .isLength({ max: 100 }) // specify the maximum length for the question
    .withMessage(validationMessage.general.questionLength),
  body("agreement_content")
    .isLength({ max: 1000 }) // specify the maximum length for the answer
    .withMessage(validationMessage.general.answerLength),
];
