const catchAsyncError = require("../helpers/catchAsyncError");
const { returnMessage } = require("../utils/utils");
const statusCode = require("../messages/statusCodes.json");
const TeamMemberService = require("../services/teamMemberService");
const { sendResponse } = require("../utils/sendResponse");
const teamMemberService = new TeamMemberService();

// Team Member add
exports.add = catchAsyncError(async (req, res, next) => {
  const user_id = req.user.reference_id;
  const teamMember = await teamMemberService.add(req.body, user_id);
  sendResponse(
    res,
    true,
    returnMessage("teamMember", "invitationSent"),
    teamMember,
    statusCode.success
  );
});

// Team Member Verification
exports.verify = catchAsyncError(async (req, res, next) => {
  await teamMemberService.verify(req.body);
  sendResponse(
    res,
    true,
    returnMessage("teamMember", "passwordSet"),
    null,
    statusCode.success
  );
});

// Team Member Login
exports.login = catchAsyncError(async (req, res, next) => {
  const teamMember = await teamMemberService.login(req.body);
  sendResponse(
    res,
    true,
    returnMessage("auth", "loggedIn"),
    teamMember,
    statusCode.success
  );
});

//  Get one Team Member

exports.getMember = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const teamMember = await teamMemberService.getMember(id);
  sendResponse(
    res,
    true,
    returnMessage("teamMember", "memberGet"),
    teamMember,
    statusCode.success
  );
});

//  Delete Team Member

exports.deleteMember = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  await teamMemberService.deleteMember(id);
  sendResponse(
    res,
    true,
    returnMessage("teamMember", "deleted"),
    null,
    statusCode.success
  );
});

//  Get All Team Member

exports.getAll = catchAsyncError(async (req, res, next) => {
  const user_id = req.user._id;
  const { pagination, teamMemberList } = await teamMemberService.getAll(
    user_id,
    req.body
  );
  sendResponse(
    res,
    true,
    returnMessage("teamMember", "TeamMemberFetched"),
    teamMemberList,
    statusCode.success,
    pagination
  );
});

//  Edit Team Member

exports.editMember = catchAsyncError(async (req, res, next) => {
  const user_id = req.user._id;
  const teamMember = await teamMemberService.editMember(req.body, user_id);
  sendResponse(
    res,
    true,
    returnMessage("teamMember", "updated"),
    teamMember,
    statusCode.success
  );
});
