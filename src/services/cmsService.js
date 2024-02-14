const logger = require("../logger");
const { throwError } = require("../helpers/errorUtil");
const {
  paginationObject,
  inquiryEmail,
  returnMessage,
} = require("../utils/utils");
const sendEmail = require("../helpers/sendEmail");
const Price_Plan = require("../models/cms/priceSchema");
const Privacy_Policy = require("../models/cms/privacyPolicySchema");
const Contact_Us = require("../models/cms/contactUsSchema");
const Technology_Stack = require("../models/cms/technologyStackSchema");

class cmsService {
  updateContactUs = async (payload) => {
    try {
      const { description } = payload;
      const contactDetailCrm = await Contact_Us.findOne({});

      await Contact_Us.findOneAndUpdate(
        {
          _id: contactDetailCrm._id,
        },
        { description },
        { new: true, useFindAndModify: false }
      );

      return true;
    } catch (error) {
      console.log(error);
      logger.error(`Error while update Contact Us CRM : ${error}`);
      return throwError(error?.message, error?.statusCode);
    }
  };

  getContactUs = async () => {
    try {
      const contactDetail = await Contact_Us.findOne({});
      return contactDetail;
    } catch (error) {
      console.log(error);
      logger.error(`Error while get Contact Us CRM : ${error}`);
      return throwError(error?.message, error?.statusCode);
    }
  };

  // Update Policy

  updatePrivacyPolicy = async (payload) => {
    try {
      const { description } = payload;

      const policy = await Privacy_Policy.findOne({});

      console.log(policy);

      await Privacy_Policy.findOneAndUpdate(
        {
          _id: policy._id,
        },
        { description },
        { new: true, useFindAndModify: false }
      );
      return true;
    } catch (error) {
      logger.error(`Error while add policy CRM : ${error}`);
      return throwError(error?.message, error?.statusCode);
    }
  };

  getPrivacyPolicy = async () => {
    try {
      const policy = await Privacy_Policy.findOne({});

      return policy;
    } catch (error) {
      logger.error(`Error while Get policy CRM : ${error}`);
      return throwError(error?.message, error?.statusCode);
    }
  };

  // Update Plan

  updatePricePlan = async (payload) => {
    try {
      const { description } = payload;

      const plan = await Price_Plan.findOne({});

      await Price_Plan.findOneAndUpdate(
        {
          _id: plan._id,
        },
        { description },
        { new: true, useFindAndModify: false }
      );
      return true;
    } catch (error) {
      logger.error(`Error while add new plan CMS : ${error}`);
      return throwError(error?.message, error?.statusCode);
    }
  };
  // Get Plan

  getPricePlan = async () => {
    try {
      const plan = await Price_Plan.findOne({});
      return plan;
    } catch (error) {
      logger.error(`Error while Get plan CRM : ${error}`);
      return throwError(error?.message, error?.statusCode);
    }
  };

  // Update Technology Stack

  updateTechnologyStack = async (payload) => {
    try {
      const { description } = payload;
      const technology = await Technology_Stack.findOne({});

      await Technology_Stack.findOneAndUpdate(
        {
          _id: technology._id,
        },
        { description },
        { new: true, useFindAndModify: false }
      );
      return true;
    } catch (error) {
      logger.error(`Error while update technologyStack CMS : ${error}`);
      return throwError(error?.message, error?.statusCode);
    }
  };

  // Get Plan

  getTechnologyStack = async () => {
    try {
      const technologyStack = await Technology_Stack.findOne({});
      return technologyStack;
    } catch (error) {
      logger.error(`Error while get technologyStack CRM : ${error}`);
      return throwError(error?.message, error?.statusCode);
    }
  };
}

module.exports = cmsService;
