const catchAsyncError = require("../helpers/catchAsyncError");
const ClientService = require("../services/clientService");
const clientService = new ClientService();
const { sendResponse } = require("../utils/sendResponse");
const { returnMessage } = require("../utils/utils");
const statusCode = require("../messages/statusCodes.json");
const { throwError } = require("../helpers/errorUtil");

exports.createClient = catchAsyncError(async (req, res, next) => {
  const new_client = await clientService.createClient(req.body, req.user);
  sendResponse(
    res,
    true,
    returnMessage("agency", "clientCreated"),
    new_client,
    statusCode.success
  );
});

exports.verifyClient = catchAsyncError(async (req, res, next) => {
  const client_verified = await clientService.verifyClient(req.body);
  sendResponse(
    res,
    true,
    returnMessage("client", "clientVerified"),
    client_verified,
    statusCode.success
  );
});

exports.deleteClient = catchAsyncError(async (req, res, next) => {
  if (!req.params?.clientId)
    return throwError(returnMessage("default", "default"));

  await clientService.deleteClient(client_id, req.user);
  sendResponse(
    res,
    true,
    returnMessage("client", "clientDeleted"),
    {},
    statusCode.success
  );
});

exports.clients = catchAsyncError(async (req, res, next) => {
  const clients = await clientService.clientList(req.user);
  sendResponse(res, true, null, clients, statusCode.success);
});
