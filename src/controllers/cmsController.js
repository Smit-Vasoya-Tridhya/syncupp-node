const catchAsyncError = require("../helpers/catchAsyncError");
const { returnMessage } = require("../utils/utils");
const statusCode = require("../messages/statusCodes.json");
const CmsService = require("../services/cmsService");
const { sendResponse } = require("../utils/sendResponse");
const cmsService = new CmsService();

//-------------------------- Contact Us  ------------------------------

// Update   Contact CMS

exports.updateContactUs = catchAsyncError(async (req, res, next) => {
  const data = await cmsService.updateContactUs(req.body);
  sendResponse(
    res,
    true,
    returnMessage("cms", "contactUpdated"),
    data,
    statusCode.success
  );
});

// Get   Contact CMS

exports.getContactUs = catchAsyncError(async (req, res, next) => {
  const data = await cmsService.getContactUs();
  sendResponse(
    res,
    true,
    returnMessage("cms", "contactFetched"),
    data,
    statusCode.success
  );
});

//--------------------------  Privacy Policy  ------------------------------

// Update   Privacy Policy CMS

exports.updatePrivacyPolicy = catchAsyncError(async (req, res, next) => {
  const data = await cmsService.updatePrivacyPolicy(req?.body);
  sendResponse(
    res,
    true,
    returnMessage("cms", "privacyUpdated"),
    data,
    statusCode.success
  );
});

// GET  Privacy Policy CMS

exports.getPrivacyPolicy = catchAsyncError(async (req, res, next) => {
  const data = await cmsService.getPrivacyPolicy();
  sendResponse(
    res,
    true,
    returnMessage("cms", "policyFetched"),
    data,
    statusCode.success
  );
});

//--------------------------  Price Plan  ------------------------------

// Update   Privacy Policy CMS

exports.updatePricePlan = catchAsyncError(async (req, res, next) => {
  const data = await cmsService.updatePricePlan(req?.body);
  sendResponse(
    res,
    true,
    returnMessage("cms", "planUpdated"),
    data,
    statusCode.success
  );
});

// GET   Plan CMS

exports.getPricePlan = catchAsyncError(async (req, res, next) => {
  const data = await cmsService.getPricePlan();
  sendResponse(
    res,
    true,
    returnMessage("cms", "planFetched"),
    data,
    statusCode.success
  );
});

//--------------------------  Technology Stack CMS  ------------------------------

// Update   technology Stack CMS

exports.updateTechnologyStack = catchAsyncError(async (req, res, next) => {
  const data = await cmsService.updateTechnologyStack(req?.body);
  sendResponse(
    res,
    true,
    returnMessage("cms", "technologyUpdated"),
    data,
    statusCode.success
  );
});

// GET   technology Stack CMS

exports.getTechnologyStack = catchAsyncError(async (req, res, next) => {
  const data = await cmsService.getTechnologyStack();
  sendResponse(
    res,
    true,
    returnMessage("cms", "technologyFetched"),
    data,
    statusCode.success
  );
});

exports.updateAboutUs = catchAsyncError(async (req, res, next) => {
  const data = await cmsService.updateAboutUs(req?.body);
  sendResponse(
    res,
    true,
    returnMessage("cms", "AboutUsUpdated"),
    data,
    statusCode.success
  );
});

// GET   technology Stack CMS

exports.getAboutUS = catchAsyncError(async (req, res, next) => {
  const data = await cmsService.getAboutUs();
  sendResponse(
    res,
    true,
    returnMessage("cms", "AboutUsFetched"),
    data,
    statusCode.success
  );
});
