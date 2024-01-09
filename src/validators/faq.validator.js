const { body } = require("express-validator");
const validationMessage = require("../messages/valiation.json");

exports.addFaqValidator = [
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
exports.deleteFaqValidator = [
  body("faqIdsToDelete")
    .not()
    .isEmpty()
    .withMessage(validationMessage.general.faqIdsReq),
];
exports.updateFaqValidator = [
  body("question")
    .isLength({ max: 100 }) // specify the maximum length for the question
    .withMessage(validationMessage.general.questionLength),
  body("answer")
    .isLength({ max: 1000 }) // specify the maximum length for the answer
    .withMessage(validationMessage.general.answerLength),
];
