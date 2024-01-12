const catchAsyncError = require("../helpers/catchAsyncError");
const { returnMessage } = require("../utils/utils");
const statusCode = require("../messages/statusCodes.json");
const InvoiceService = require("../services/invoiceService");
const { sendResponse } = require("../utils/sendResponse");
const invoiceService = new InvoiceService();

// Add Clients

exports.getClients = catchAsyncError(async (req, res, next) => {
  const getClients = await invoiceService.getClients(req?.user);
  sendResponse(
    res,
    true,
    returnMessage("invoice", "clientFetched"),
    getClients,
    statusCode.success
  );
});

// Add Invoice

exports.addInvoice = catchAsyncError(async (req, res, next) => {
  const addedInvoice = await invoiceService.addInvoice(
    req.body,
    req?.user?._id
  );
  sendResponse(
    res,
    true,
    returnMessage("invoice", "invoiceCreated"),
    addedInvoice,
    statusCode.success
  );
});

// // get All Agreement

// exports.getAllAgreement = catchAsyncError(async (req, res, next) => {
//   const { agreements, pagination } = await agreementService.getAllAgreement(
//     req.body,
//     req?.user?._id
//   );
//   sendResponse(
//     res,
//     true,
//     returnMessage("agreement", "getAllAgreement"),
//     agreements,
//     statusCode.success,
//     pagination
//   );
// });

// // delete Agreement

// exports.deleteAgreement = catchAsyncError(async (req, res, next) => {
//   console.log(req?.params?.id);
//   await agreementService.deleteAgreement(req?.params?.id);
//   sendResponse(
//     res,
//     true,
//     returnMessage("agreement", "deleteAgreement"),
//     null,
//     statusCode.success
//   );
// });

// // Update Agreement

// exports.updateAgreement = catchAsyncError(async (req, res, next) => {
//   const updatedAgreement = await agreementService.updateAgreement(
//     req.body,
//     req?.params?.id
//   );
//   sendResponse(
//     res,
//     true,
//     returnMessage("agreement", "agreementUpdated"),
//     updatedAgreement,
//     statusCode.success
//   );
// });

// // Get Agreement

// exports.getAgreement = catchAsyncError(async (req, res, next) => {
//   const getAgreement = await agreementService.getAgreement(req?.params?.id);
//   sendResponse(
//     res,
//     true,
//     returnMessage("agreement", "getAgreement"),
//     getAgreement,
//     statusCode.success
//   );
// });

// // -------------------   Clint API   ------------------------

// // Update Agreement status

// exports.updateAgreementStatus = catchAsyncError(async (req, res, next) => {
//   const updatedAgreement = await agreementService.updateAgreementStatus(
//     req.body,
//     req?.params?.id
//   );
//   sendResponse(
//     res,
//     true,
//     returnMessage("agreement", "agreementStatusUpdated"),
//     updatedAgreement,
//     statusCode.success
//   );
// });

// // get All Agreement

// exports.getAllClientAgreement = catchAsyncError(async (req, res, next) => {
//   const { agreements, pagination } =
//     await agreementService.getAllClientAgreement(req.body, req?.user?._id);
//   sendResponse(
//     res,
//     true,
//     returnMessage("agreement", "getAllAgreement"),
//     agreements,
//     statusCode.success,
//     pagination
//   );
// });
