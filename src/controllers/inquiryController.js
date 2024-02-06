const catchAsyncError = require("../helpers/catchAsyncError");
const { returnMessage } = require("../utils/utils");
const statusCode = require("../messages/statusCodes.json");
const InquiryService = require("../services/inquiryService");
const { sendResponse } = require("../utils/sendResponse");
const inquiryService = new InquiryService();

// Add   Inquiry

exports.addInquiry = catchAsyncError(async (req, res, next) => {
  const inquiry = await inquiryService.addInquiry(req.body);

  sendResponse(
    res,
    true,
    returnMessage("inquiry", "inquirySent"),
    inquiry,
    statusCode.success
  );
});

// Get All Inquiries

exports.getAllInquiry = catchAsyncError(async (req, res, next) => {
  const inquiries = await inquiryService.getAllInquiry(req.body);
  sendResponse(
    res,
    true,
    returnMessage("inquiry", "inquiryList"),
    inquiries,
    statusCode.success
  );
});

// Delete Inquiries

exports.deleteInquiry = catchAsyncError(async (req, res, next) => {
  await inquiryService.deleteInquiry(req.body);
  sendResponse(
    res,
    true,
    returnMessage("inquiry", "inquiryDelete"),
    null,
    statusCode.success
  );
});
