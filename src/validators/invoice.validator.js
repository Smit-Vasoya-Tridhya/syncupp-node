// const { body, validationResult } = require("express-validator");
// const validationMessage = require("../messages/valiation.json");

// exports.validateCreateInvoice = [
//   body("invoice_number").notEmpty().isString(),
//   body("due_date").notEmpty().isISO8601(),
//   body("status").notEmpty().isMongoId(),
//   body("client_id").notEmpty().isMongoId(),
//   body("agency_id").notEmpty().isMongoId(),
//   body("invoice_content")
//     .isArray({ min: 1 })
//     .custom((value) => {
//       // Custom validation for each element in invoice_content array
//       value.forEach((item, index) => {
//         if (
//           !item.item ||
//           !item.qty ||
//           !item.rate ||
//           !item.tax ||
//           !item.amount
//         ) {
//           throw new Error(`Invalid data in invoice_content at index ${index}`);
//         }
//       });
//       return true;
//     }),
//   body("is_delete").isBoolean(),
//   body("sub_total").isNumeric(),
//   body("total").isNumeric(),
// ];
