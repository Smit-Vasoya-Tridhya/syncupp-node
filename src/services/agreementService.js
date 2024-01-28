const Agreement = require("../models/agreementSchema");
const logger = require("../logger");
const { throwError } = require("../helpers/errorUtil");
const { returnMessage } = require("../utils/utils");
const { paginationObject, getKeywordType } = require("./commonSevice");
const sendEmail = require("../helpers/sendEmail");
const Authentication = require("../models/authenticationSchema");

class AgreementService {
  // Add   Agreement
  addAgreement = async (payload, user_id) => {
    try {
      const {
        client_id,
        title,
        agreement_content,
        due_date,
        status,
        receiver,
      } = payload;
      const agreement = await Agreement.create({
        client_id,
        title,
        agreement_content,
        due_date,
        status,
        receiver,
        agency_id: user_id,
      });
      return agreement;
    } catch (error) {
      logger.error(`Error while Admin add Agreement, ${error}`);
      throwError(error?.message, error?.statusCode);
    }
  };

  // GET All Agreement
  getAllAgreement = async (searchObj, user_id) => {
    try {
      const queryObj = { is_deleted: false, agency_id: user_id };

      const pagination = paginationObject(searchObj);
      const agreements = await Agreement.find(queryObj)
        .skip(pagination.skip)
        .limit(pagination.resultPerPage)
        .sort(pagination.sort);

      const totalAgreementsCount = await Agreement.countDocuments(queryObj);

      // Calculating total pages
      const pages = Math.ceil(totalAgreementsCount / pagination.resultPerPage);

      return {
        agreements,
        pagination: {
          current_page: pagination.page,
          total_pages: pages,
        },
      };
    } catch (error) {
      logger.error(`Error while Admin Agreement Listing, ${error}`);
      throwError(error?.message, error?.statusCode);
    }
  };

  // GET Agreement

  getAgreement = async (agreementId) => {
    try {
      const agreement = await Agreement.findOne({
        _id: agreementId,
        is_deleted: false,
      }).lean();
      return agreement;
    } catch (error) {
      logger.error(`Error while Get Agreement, ${error}`);
      throwError(error?.message, error?.statusCode);
    }
  };

  // Delete Agreement
  deleteAgreement = async (payload) => {
    try {
      const agreementIdToDelete = payload;
      const agreement = await Agreement.findOne({
        _id: agreementIdToDelete,
        is_deleted: false,
      }).lean();

      if (agreement.status === "draft") {
        await Agreement.updateOne(
          { _id: agreementIdToDelete },
          { $set: { is_deleted: true } }
        );
        return true;
      } else {
        return throwError(returnMessage("agreement", "canNotDelete"));
      }
    } catch (error) {
      logger.error(`Error while Deleting Agreement, ${error}`);
      throwError(error?.message, error?.statusCode);
    }
  };

  // update   Agreement

  updateAgreement = async (payload, agreementId) => {
    try {
      const { title, agreement_content, due_date, status, receiver } = payload;
      const agreement = await Agreement.findOne({
        _id: agreementId,
        is_deleted: false,
      }).lean();
      if (agreement.status === "draft") {
        const updatedAgreement = await Agreement.findByIdAndUpdate(
          {
            _id: agreementId,
          },
          {
            title,
            agreement_content,
            due_date,
            status,
            receiver,
          },
          { new: true, useFindAndModify: false }
        );
        return updatedAgreement;
      } else {
        return throwError(returnMessage("agreement", "canNotUpdate"));
      }
    } catch (error) {
      logger.error(`Error while updating Agreement, ${error}`);
      throwError(error?.message, error?.statusCode);
    }
  };

  // Send Agreement

  sendAgreement = async (payload) => {
    try {
      const { agreementId } = payload;

      const agreement = await Agreement.findOne({
        _id: agreementId,
        is_deleted: false,
      }).lean();

      const clientDetails = await Authentication.findOne({
        _id: agreement.client_id,
      });

      await sendEmail({
        email: clientDetails?.email,
        subject: "New agreement",
        message: agreement,
      });

      return true;
    } catch (error) {
      logger.error(`Error while send Agreement, ${error}`);
      throwError(error?.message, error?.statusCode);
    }
  };

  // -------------------   Client API ----------------------

  // Update Client Agreement

  updateAgreementStatus = async (payload, agreementId) => {
    try {
      const { status } = payload;
      const agreement = await Agreement.findOneAndUpdate(
        {
          _id: agreementId,
        },
        { status },
        { new: true, useFindAndModify: false }
      );
      return agreement;
    } catch (error) {
      logger.error(`Error while updating Agreement, ${error}`);
      throwError(error?.message, error?.statusCode);
    }
  };

  // GET Client Agreement agencyWise
  getAllClientAgreement = async (searchObj, client_id) => {
    const { agency_id } = searchObj;
    try {
      const queryObj = {
        is_deleted: false,
        client_id: client_id,
        agency_id: agency_id,
      };

      const pagination = paginationObject(searchObj);
      const agreements = await Agreement.find(queryObj)
        .sort(pagination.sort)
        .skip(pagination.skip)
        .limit(pagination.resultPerPage);

      const totalAgreementsCount = await Agreement.countDocuments(queryObj);

      // Calculating total pages
      const pages = Math.ceil(totalAgreementsCount / pagination.resultPerPage);

      return {
        agreements,
        pagination: {
          current_page: pagination.page,
          total_pages: pages,
        },
      };
    } catch (error) {
      logger.error(`Error while Admin Agreement Listing, ${error}`);
      throwError(error?.message, error?.statusCode);
    }
  };
}

module.exports = AgreementService;
