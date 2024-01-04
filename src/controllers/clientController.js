const catchAsyncError = require("../helpers/catchAsyncError");
const ClientService = require("../services/clientService");
const clientService = new ClientService();
const { sendResponse } = require("../utils/sendResponse");
const { returnMessage } = require("../utils/utils");
const statusCode = require("../messages/statusCodes.json");

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
