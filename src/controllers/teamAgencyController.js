const catchAsyncError = require("../helpers/catchAsyncError");
const { returnMessage } = require("../utils/utils");
const statusCode = require("../messages/statusCodes.json");
const TeamAgencyService = require("../services/teamAgencyService");
const { sendResponse } = require("../utils/sendResponse");
const teamAgencyService = new TeamAgencyService();

// Team Member add
exports.add = catchAsyncError(async (req, res, next) => {
  const user_id = req.user.reference_id;
  await teamAgencyService.add(req.body, user_id);
  sendResponse(
    res,
    true,
    returnMessage("teamAgency", "invitationSent"),
    null,
    statusCode.success
  );
});

// Team Member Verification
exports.verify = catchAsyncError(async (req, res, next) => {
  await teamAgencyService.verify(req.body);
  sendResponse(
    res,
    true,
    returnMessage("teamAgency", "passwordSet"),
    null,
    statusCode.success
  );
});

// Team Member Login
exports.login = catchAsyncError(async (req, res, next) => {
  const teamMember = await teamAgencyService.login(req.body);
  sendResponse(
    res,
    true,
    returnMessage("auth", "loggedIn"),
    teamMember,
    statusCode.success
  );
});

//  Get one Team Member

exports.getOne = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const teamMember = await teamAgencyService.getOne(id);
  sendResponse(
    res,
    true,
    returnMessage("teamAgency", "memberGet"),
    teamMember,
    statusCode.success
  );
});

//  Delete Team Member

exports.deleteMember = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  await teamAgencyService.delete(id);
  sendResponse(
    res,
    true,
    returnMessage("teamAgency", "deleted"),
    null,
    statusCode.success
  );
});
//  Get All Team Member

exports.getAll = catchAsyncError(async (req, res, next) => {
  const user_id = req.user._id;
  const { result, pagination } = await teamAgencyService.getAll(
    user_id,
    req,
    req.query
  );
  sendResponse(
    res,
    true,
    returnMessage("teamAgency", "TeamMemberFetched"),
    result,
    statusCode.success,
    pagination
  );
});
