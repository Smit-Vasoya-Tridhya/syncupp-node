const logger = require("../logger");
const { throwError } = require("../helpers/errorUtil");
const {
  paginationObject,
  inquiryEmail,
  returnMessage,
} = require("../utils/utils");
const sendEmail = require("../helpers/sendEmail");
const ContactCms = require("../models/cms/contactUsSchema");

class cmsService {
  addContactUs = async (payload) => {
    try {
      const { title, description, email, contact_number } = payload;

      const contactDetailCrm = await ContactCms.findOne({});

      const contactDetail = await ContactCms.updateOne(
        { _id: contactDetailCrm._id },
        {
          $set: { title, description, email, contact_number },
        },
        { upsert: true }
      );

      return contactDetail;
    } catch (error) {
      console.log(error);
      logger.error(`Error while add Contact Us CRM : ${error}`);
      return throwError(error?.message, error?.statusCode);
    }
  };

  getContactUs = async () => {
    try {
      const contactDetail = await ContactCms.findOne({});
      return contactDetail;
    } catch (error) {
      console.log(error);
      logger.error(`Error while add Contact Us CRM : ${error}`);
      return throwError(error?.message, error?.statusCode);
    }
  };
}

module.exports = cmsService;
