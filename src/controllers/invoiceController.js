const catchAsyncError = require("../helpers/catchAsyncError");
const { returnMessage } = require("../utils/utils");
const statusCode = require("../messages/statusCodes.json");
const InvoiceService = require("../services/invoiceService");
const { sendResponse } = require("../utils/sendResponse");
const invoiceService = new InvoiceService();

// Add Clients ------   AGENCY API

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

// Get InvoiceInformation ------   AGENCY API

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

// Add Invoice ------   AGENCY API

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

// get All Invoice ------   AGENCY API

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

// Get Invoice     ------   AGENCY API

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

// delete Invoice ------   AGENCY API

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

// Update Invoice  ------   Agency API

exports.updateInvoice = catchAsyncError(async (req, res, next) => {
  await invoiceService.updateInvoice(req.body, req?.params?.id);
  sendResponse(
    res,
    true,
    returnMessage("invoice", "invoiceUpdated"),
    null,
    statusCode.success
  );
});

// Update Invoice Status ------   Agency API

exports.updateStatusInvoice = catchAsyncError(async (req, res, next) => {
  await invoiceService.updateStatusInvoice(req.body, req?.params?.id);
  sendResponse(
    res,
    true,
    returnMessage("invoice", "invoiceStatusUpdated"),
    null,
    statusCode.success
  );
});

// get All Client Invoice ------   Client API

exports.getClientInvoice = catchAsyncError(async (req, res, next) => {
  const { invoices, pagination } = await invoiceService.getClientInvoice(
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
