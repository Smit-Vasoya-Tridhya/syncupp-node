const Inquiry = require("../models/inquirySchema");
const logger = require("../logger");
const { throwError } = require("../helpers/errorUtil");
const {
  paginationObject,
  inquiryEmail,
  returnMessage,
} = require("../utils/utils");
const sendEmail = require("../helpers/sendEmail");
const Admin = require("../models/adminSchema");

class inquiryService {
  // Add   Inquiry
  addInquiry = async (payload) => {
    try {
      const { name, contact_number, email, message } = payload;
      const inquiry = await Inquiry.create({
        name,
        contact_number,
        email,
        message,
      });

      const admin = await Admin.findOne({});

      // Use a template or format the invoice message accordingly
      const formattedInquiryEmail = inquiryEmail(inquiry);

      await sendEmail({
        email: admin?.email,
        subject: returnMessage("inquiry", "newInquiry"),
        message: formattedInquiryEmail,
      });

      return inquiry;
    } catch (error) {
      logger.error(`Error while Inquiry create, ${error}`);
      throwError(error?.message, error?.statusCode);
    }
  };

  // GET All Inquires
  getAllInquiry = async (searchObj) => {
    try {
      console.log(searchObj);
      const queryObj = { is_deleted: false };

      if (searchObj.search && searchObj.search !== "") {
        queryObj["$or"] = [
          {
            name: {
              $regex: searchObj.search.toLowerCase(),
              $options: "i",
            },
          },
          {
            email: {
              $regex: searchObj.search.toLowerCase(),
              $options: "i",
            },
          },
          {
            message: {
              $regex: searchObj.search.toLowerCase(),
              $options: "i",
            },
          },
          {
            contact_number: {
              $regex: searchObj.search.toLowerCase(),
              $options: "i",
            },
          },
        ];
      }

      const pagination = paginationObject(searchObj);

      const [inquiries, totalInquiryCount] = await Promise.all([
        Inquiry.find(queryObj)
          .select("-is_deleted -__v ")
          .sort(pagination.sort)
          .skip(pagination.skip)
          .limit(pagination.result_per_page)
          .lean(),
        Inquiry.countDocuments(queryObj),
      ]);

      return {
        inquiries,
        page_count:
          Math.ceil(totalInquiryCount / pagination.result_per_page) || 0,
      };
    } catch (error) {
      logger.error(`Error while Inquiry Listing, ${error}`);
      throwError(error?.message, error?.statusCode);
    }
  };

  // Delete Inquires

  deleteInquiry = async (payload) => {
    try {
      const { inquiryIdsToDelete } = payload;

      await Inquiry.updateMany(
        { _id: { $in: inquiryIdsToDelete } },
        { $set: { is_deleted: true } },
        { new: true }
      );
      return true;
    } catch (error) {
      logger.error(`Error while Inquiry Delete, ${error}`);
      throwError(error?.message, error?.statusCode);
    }
  };
}

module.exports = inquiryService;
