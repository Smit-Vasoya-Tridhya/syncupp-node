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

// Get InvoiceInformation

exports.getInvoiceInformation = catchAsyncError(async (req, res, next) => {
  const { getAgencyData, getClientData } =
    await invoiceService.getInvoiceInformation(req?.body, req?.user);
  sendResponse(
    res,
    true,
    returnMessage("invoice", "invoiceInfo"),
    [{ agencyData: getAgencyData }, { clientData: getClientData }],
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

// get All Invoice

exports.getAllInvoice = catchAsyncError(async (req, res, next) => {
  const { invoices, pagination } = await invoiceService.getAllInvoice(
    req.body,
    req?.user?._id
  );
  sendResponse(
    res,
    true,
    returnMessage("invoice", "getAllInvoices"),
    invoices,
    statusCode.success,
    pagination
  );
});

// Get Agreement

exports.getInvoice = catchAsyncError(async (req, res, next) => {
  const getInvoice = await invoiceService.getInvoice(req?.params?.id);
  sendResponse(
    res,
    true,
    returnMessage("invoice", "getAllInvoices"),
    getInvoice,
    statusCode.success
  );
});

// delete Invoice

exports.deleteInvoice = catchAsyncError(async (req, res, next) => {
  await invoiceService.deleteInvoice(req?.params?.id);
  sendResponse(
    res,
    true,
    returnMessage("invoice", "invoiceDeleted"),
    null,
    statusCode.success
  );
});

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
