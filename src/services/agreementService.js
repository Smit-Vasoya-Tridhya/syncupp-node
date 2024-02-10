const Agreement = require("../models/agreementSchema");
const logger = require("../logger");
const { throwError } = require("../helpers/errorUtil");
const {
  returnMessage,
  agrementEmail,
  paginationObject,
  getKeywordType,
} = require("../utils/utils");
// const { getKeywordType } = require("./commonSevice");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const sendEmail = require("../helpers/sendEmail");
const Authentication = require("../models/authenticationSchema");
const Client = require("../models/clientSchema");
const { default: mongoose } = require("mongoose");

class AgreementService {
  // Add   Agreement
  addAgreement = async (payload, user) => {
    try {
      const {
        client_id,
        title,
        agreement_content,
        due_date,
        status,
        receiver,
        send,
      } = payload;
      const dueDate = new Date(due_date);

      const auth = await Authentication.findById(receiver).populate("role");
      if (auth.role.name === "client") {
        const client = await Client.findOne({
          _id: auth.reference_id,
          "agency_ids.agency_id": user.reference_id,
        });

        if (!client) {
          return throwError(returnMessage("agreement", "clientnotexist"));
        }
      }
      if (send === true) {
        const clientDetails = await Authentication.findOne({
          _id: receiver,
        });
        const ageremantMessage = agrementEmail(payload);
        await sendEmail({
          email: clientDetails?.email,
          subject: "New agreement",
          message: ageremantMessage,
        });
        payload.status = "sent";
      }

      const agreement = await Agreement.create({
        title,
        agreement_content,
        due_date: dueDate,
        status,
        receiver,
        agency_id: user._id,
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

      if (searchObj.search && searchObj.search !== "") {
        queryObj["$or"] = [
          {
            title: {
              $regex: searchObj.search.toLowerCase(),
              $options: "i",
            },
          },
          {
            status: {
              $regex: searchObj.search.toLowerCase(),
              $options: "i",
            },
          },

          {
            "agreement_Data.name": {
              $regex: searchObj.search.toLowerCase(),
              $options: "i",
            },
          },
        ];

        const keywordType = getKeywordType(searchObj.search);
        if (keywordType === "date") {
          const dateKeyword = new Date(searchObj.search);
          queryObj["$or"].push({ due_date: dateKeyword });
        }
      }
      const pagination = paginationObject(searchObj);
      const aggregationPipeline = [
        {
          $lookup: {
            from: "authentications",
            localField: "receiver",
            foreignField: "_id",
            as: "agreement_Data",
          },
        },
        {
          $unwind: "$agreement_Data",
        },
        {
          $match: queryObj,
        },
        {
          $project: {
            first_name: "$agreement_Data.first_name",
            last_name: "$agreement_Data.last_name",
            email: "$agreement_Data.email",
            receiver: "$agreement_Data.name",
            contact_number: 1,
            title: 1,
            status: 1,
            agreement_content: 1,
            due_date: 1,
            createdAt: 1,
          },
        },
      ];
      const agreements = await Agreement.aggregate(aggregationPipeline)
        .sort(pagination.sort)
        .skip(pagination.skip)
        .limit(pagination.result_per_page);

      const totalAgreementsCount = await Agreement.aggregate(
        aggregationPipeline
      );

      return {
        agreements,
        page_count:
          Math.ceil(totalAgreementsCount.length / pagination.result_per_page) ||
          0,
      };
    } catch (error) {
      logger.error(`Error while Admin Agreement Listing, ${error}`);
      throwError(error?.message, error?.statusCode);
    }
  };

  // GET Agreement

  getAgreement = async (agreementId) => {
    try {
      const aggregationPipeline = [
        {
          $lookup: {
            from: "authentications",
            localField: "receiver",
            foreignField: "_id",
            as: "receiver_Data",
          },
        },

        {
          $unwind: "$receiver_Data",
        },

        {
          $match: {
            _id: new mongoose.Types.ObjectId(agreementId),
            is_deleted: false,
          },
        },
        {
          $project: {
            _id: 1,
            first_name: "$receiver_Data.first_name",
            last_name: "$receiver_Data.last_name",
            email: "$receiver_Data.email",
            receiver: "$receiver_Data.name",
            receiver_email: "$receiver_Data.email",
            receiver_number: "$receiver_Data.contact_number",
            receiver_id: "$receiver_Data._id",
            contact_number: 1,
            sender: "$sender_Data.name",
            sender_email: "$sender_Data.email",
            sender_number: "$sender_Data.contact_number",
            sender_first_name: "$sender_Data.first_name",
            sender_last_name: "$sender_Data.last_name",
            sender_id: "$sender_Data._id",
            title: 1,
            status: 1,
            agreement_content: 1,
            due_date: 1,
          },
        },
      ];
      const agreement = await Agreement.aggregate(aggregationPipeline);
      const agreement_result = agreement.length > 0 ? agreement[0] : agreement;
      return agreement_result;
    } catch (error) {
      logger.error(`Error while Get Agreement, ${error}`);
      throwError(error?.message, error?.statusCode);
    }
  };

  deleteAgreement = async (payload) => {
    try {
      const { agreementIdsToDelete } = payload;

      const agreements = await Agreement.find({
        _id: { $in: agreementIdsToDelete },
        is_deleted: false,
      }).lean();

      const deletableAgreements = agreements.filter(
        (agreement) => agreement.status === "draft"
      );

      if (deletableAgreements.length === agreementIdsToDelete.length) {
        await Agreement.updateMany(
          { _id: { $in: agreementIdsToDelete } },
          { $set: { is_deleted: true } },
          { new: true }
        );
        return true;
      } else {
        return throwError(returnMessage("agreement", "canNotDelete"));
      }
    } catch (error) {
      logger.error(`Error while Deleting Agreement(s): ${error}`);
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

      if (status === "sent") {
        const clientDetails = await Authentication.findOne({
          _id: agreement.receiver,
        });

        const ageremantMessage = agrementEmail(agreement);
        await sendEmail({
          email: clientDetails?.email,
          subject: "Updated agreement",
          message: ageremantMessage,
        });
        payload.status = "sent";
      }

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
        _id: agreement.receiver,
      });
      const ageremantMessage = agrementEmail(agreement);
      await sendEmail({
        email: clientDetails?.email,
        subject: "New agreement",
        message: ageremantMessage,
      });

      if (agreement.status === "sent" || agreement.status === "draft") {
        const updatedAgreement = await Agreement.findByIdAndUpdate(
          {
            _id: agreementId,
          },
          {
            status: "sent",
          },
          { new: true, useFindAndModify: false }
        );
      }

      return true;
    } catch (error) {
      logger.error(`Error while send Agreement, ${error}`);
      throwError(error?.message, error?.statusCode);
    }
  };

  updateAgreementStatusAgency = async (payload, agreementId) => {
    try {
      const { status } = payload;
      if (status === "sent") {
        const agreement = await Agreement.findOne({
          _id: agreementId,
          is_deleted: false,
        }).lean();

        const clientDetails = await Authentication.findOne({
          _id: agreement.receiver,
        });
        const agreement_detail = await this.getAgreement(agreementId);

        const ageremantMessage = agrementEmail(agreement_detail);
        await sendEmail({
          email: clientDetails?.email,
          subject: "Updated agreement",
          message: ageremantMessage,
        });
      }
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
  // -------------------   Client API ----------------------

  // Update Client Agreement

  updateAgreementStatus = async (payload, agreementId) => {
    try {
      const { status } = payload;
      if (status === "sent") {
        const agreement = await Agreement.findOne({
          _id: agreementId,
          is_deleted: false,
        }).lean();

        const clientDetails = await Authentication.findOne({
          _id: agreement.client_id,
        });
        const agreement_detail = await this.getAgreement(agreementId);

        const ageremantMessage = agrementEmail(agreement_detail);
        await sendEmail({
          email: clientDetails?.email,
          subject: "Updated agreement",
          message: ageremantMessage,
        });
      }
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
    let agency_id = searchObj.agency_id;

    agency_id = await Authentication.findOne({ reference_id: agency_id });
    try {
      const queryObj = {
        is_deleted: false,
        receiver: client_id,
        agency_id: agency_id,
      };
      if (searchObj.search && searchObj.search !== "") {
        queryObj["$or"] = [
          {
            title: {
              $regex: searchObj.search.toLowerCase(),
              $options: "i",
            },
          },

          {
            status: {
              $regex: searchObj.search.toLowerCase(),
              $options: "i",
            },
          },
        ];

        const keywordType = getKeywordType(searchObj.search);
        if (keywordType === "date") {
          const dateKeyword = new Date(searchObj.search);
          queryObj["$or"].push({ due_date: dateKeyword });
        }
      }

      const pagination = paginationObject(searchObj);
      const agreements = await Agreement.find(queryObj)
        .sort(pagination.sort)
        .skip(pagination.skip)
        .limit(pagination.result_per_page)
        .populate({
          path: "agency_id",
          model: "authentication",
          select: "name",
        });

      const totalAgreementsCount = await Agreement.countDocuments(queryObj);

      // Calculating total pages
      const pages = Math.ceil(
        totalAgreementsCount / pagination.result_per_page
      );

      return {
        agreements,
        total_pages: pages,
      };
    } catch (error) {
      logger.error(`Error while Admin Agreement Listing, ${error}`);
      throwError(error?.message, error?.statusCode);
    }
  };

  downloadPdf = async (id) => {
    try {
      const agreement = await Agreement.findOne({
        _id: id,
        is_deleted: false,
      }).lean();

      const doc = new PDFDocument();
      const pdfBuffer = [];
      return new Promise((resolve, reject) => {
        doc.on("data", (chunk) => {
          pdfBuffer.push(chunk);
        });

        doc.on("end", () => {
          const resultBuffer = Buffer.concat(pdfBuffer);
          resolve(resultBuffer);
        });

        doc.on("error", (error) => {
          reject(error);
        });

        doc
          .fontSize(16)
          .text(`Document Title: ${agreement.title}`, 50, 50)
          .text(`Receiver: ${agreement.receiver}`, 50, 80)
          .text(`Due Date: ${agreement.due_date}`, 50, 110);

        doc.end();
      });
    } catch (error) {
      logger.error(`Error while generating PDF, ${error}`);
      throwError(error?.message, error?.statusCode);
    }
  };
}

module.exports = AgreementService;
