const catchAsyncError = require("../helpers/catchAsyncError");
const { returnMessage } = require("../utils/utils");
const statusCode = require("../messages/statusCodes.json");
const TeamMemberService = require("../services/teamMemberService");
const { sendResponse } = require("../utils/sendResponse");
const teamMemberService = new TeamMemberService();

// Team Member add
exports.add = catchAsyncError(async (req, res, next) => {
  await teamMemberService.addTeamMember(req.body, req.user);
  sendResponse(
    res,
    true,
    returnMessage("teamMember", "invitationSent"),
    {},
    statusCode.success
  );
});

// Team Member Verification
exports.verify = catchAsyncError(async (req, res, next) => {
  const verify = await teamMemberService.verify(req.body);
  sendResponse(
    res,
    true,
    returnMessage("teamMember", "verified"),
    verify,
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
  const teamMember = await teamMemberService.getMember(
    req?.user?._id,
    req?.params?.id
  );
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
  await teamMemberService.deleteMember(req?.body);
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
  const teamMemberList = await teamMemberService.getAllTeam(req.body, req.user);
  sendResponse(
    res,
    true,
    returnMessage("teamMember", "TeamMemberFetched"),
    teamMemberList,
    statusCode.success
  );
});

//  Edit Team Member

exports.editMember = catchAsyncError(async (req, res, next) => {
  const teamMember = await teamMemberService.editMember(
    req.body,
    req.params.id
  );
  sendResponse(
    res,
    true,
    returnMessage("teamMember", "updated"),
    teamMember,
    statusCode.success
  );
});
