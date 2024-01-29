const Invoice = require("../models/invoiceSchema");
const Invoice_Status_Master = require("../models/masters/invoiceStatusMaster");
const logger = require("../logger");
const { throwError } = require("../helpers/errorUtil");
const { returnMessage } = require("../utils/utils");
const Client = require("../models/clientSchema");
const { ObjectId } = require("mongodb");

const {
  paginationObject,
  getKeywordType,
  calculateInvoice,
  calculateAmount,
} = require("./commonSevice");
const statusCode = require("../messages/english.json");
const Agency = require("../models/agencySchema");
const Authentication = require("../models/authenticationSchema");
const sendEmail = require("../helpers/sendEmail");

class InvoiceService {
  // Get Client list  ------   AGENCY API
  getClients = async (user) => {
    const { reference_id } = user;
    try {
      const pipeline = [
        {
          $match: {
            "agency_ids.agency_id": reference_id,
            "agency_ids.status": "active",
          },
        },
        {
          $lookup: {
            from: "authentications",
            localField: "_id",
            foreignField: "reference_id",
            as: "clientInfo",
            pipeline: [{ $project: { first_name: 1, last_name: 1, name: 1 } }],
          },
        },

        {
          $unwind: "$clientInfo",
        },
        {
          $lookup: {
            from: "clients",
            localField: "_id",
            foreignField: "_id",
            as: "clientDetails",
          },
        },

        {
          $unwind: "$clientDetails",
        },
        {
          $project: {
            _id: "$clientDetails._id",
            first_name: "$clientInfo.first_name",
            last_name: "$clientInfo.last_name",
            name: "$clientInfo.name",
          },
        },
      ];
      const findClient = await Client.aggregate(pipeline);

      return findClient;
    } catch (error) {
      logger.error(`Error while fetching agencies: ${error}`);
      return throwError(error?.message, error?.statusCode);
    }
  };

  // GET Invoice information like address , company name pin etc before creating.  ------   AGENCY API
  getInvoiceInformation = async (payload, user) => {
    try {
      const { client_id } = payload;
      const { reference_id } = user;
      const getAgencyData = await Agency.findOne(
        {
          _id: reference_id,
        },
        {
          createdAt: 0,
          updatedAt: 0,
          __v: 0,
        }
      )
        .populate("city", "name")
        .populate("state", "name")
        .populate("country", "name");
      const getClientData = await Client.findOne(
        {
          _id: client_id,
        },
        {
          agency_ids: 0,
          createdAt: 0,
          updatedAt: 0,
          __v: 0,
        }
      )
        .populate("city", "name")
        .populate("state", "name")
        .populate("country", "name");

      return { getAgencyData, getClientData };
    } catch (error) {
      logger.error(`Error while Get Invoice information, ${error}`);
      throwError(error?.message, error?.statusCode);
    }
  };

  // Add   Invoice    ------   AGENCY API
  addInvoice = async (payload, user_id) => {
    try {
      const {
        status,
        due_date,
        invoice_number,
        invoice_date,
        invoice_content,
        recipient,
      } = payload;

      const invoiceItems = invoice_content;
      calculateAmount(invoiceItems);

      const isInvoice = await Invoice.findOne({
        invoice_number: invoice_number,
      });
      if (isInvoice) {
        return throwError(returnMessage("invoice", "invoiceNumberExists"));
      }

      const { total, sub_total } = calculateInvoice(invoiceItems);

      // Update Invoice status
      const getInvoiceStatus = await Invoice_Status_Master.findOne({
        name: status,
      });

      const invoice = await Invoice.create({
        due_date,
        invoice_number,
        invoice_date,
        total,
        sub_total,
        invoice_content: invoiceItems,
        recipient,
        agency_id: user_id,
        status: getInvoiceStatus._id,
      });
      return invoice;
    } catch (error) {
      logger.error(`Error while  create Invoice, ${error}`);
      throwError(error?.message, error?.statusCode);
    }
  };

  // GET All Invoice    ------   AGENCY API
  getAllInvoice = async (searchObj, user_id) => {
    try {
      const queryObj = { is_deleted: false, agency_id: user_id };

      if (searchObj.search && searchObj.search !== "") {
        queryObj["$or"] = [
          {
            invoice_number: {
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
        if (keywordType === "number") {
          const numericKeyword = parseInt(searchObj.search);

          queryObj["$or"].push({
            total: numericKeyword,
          });
        }
      }

      const pagination = paginationObject(searchObj);
      const pipeLine = [
        {
          $match: {
            ...queryObj,
          },
        },
        {
          $lookup: {
            from: "invoice_status_masters",
            localField: "status",
            foreignField: "_id",
            as: "status",
            pipeline: [{ $project: { name: 1 } }],
          },
        },
        {
          $unwind: "$status",
        },
        {
          $lookup: {
            from: "authentications",
            localField: "recipient",
            foreignField: "reference_id",
            as: "customerInfo",
            pipeline: [{ $project: { name: 1 } }],
          },
        },
        {
          $unwind: "$customerInfo",
        },
        {
          $project: {
            _id: 1,
            invoice_number: 1,
            invoice_date: 1,
            recipient: 1,
            due_date: 1,
            customer_name: "$customerInfo.name",
            status: "$status.name",
            invoice_content: 1,
            sub_total: 1,
            total: 1,
            createdAt: 1,
            updatedAt: 1,
          },
        },
      ];

      const [invoiceList, total_invoices] = await Promise.all([
        Invoice.aggregate(pipeLine)
          .sort(pagination.sort)
          .skip(pagination.skip)
          .limit(pagination.resultPerPage),
        Invoice.aggregate(pipeLine),
      ]);

      return {
        invoiceList,
        page_count:
          Math.ceil(total_invoices.length / pagination.resultPerPage) || 0,
      };
    } catch (error) {
      logger.error(`Error while Lising ALL Invoice Listing, ${error}`);
      throwError(error?.message, error?.statusCode);
    }
  };

  // GET Agreement   ------   Client and Agency API

  getInvoice = async (invoiceId) => {
    try {
      const invoice = await Invoice.findOne({ _id: invoiceId })
        .populate("status", "name")
        .populate({
          path: "recipient",
          model: "client",
          select: "_id",
          populate: {
            path: "_id",
            model: "client",
            select: "-agency_ids -createdAt  -updatedAt -__v",
          },
        })
        .populate({
          path: "agency_id",
          model: "agency",
          select: "_id",
          populate: {
            path: "_id",
            model: "agency",
            select: "-createdAt  -updatedAt -__v",
          },
        });
      return invoice;
    } catch (error) {
      logger.error(`Error while Get Invoice, ${error}`);
      throwError(error?.message, error?.statusCode);
    }
  };

  // Update Invoice   ------   AGENCY API
  updateInvoice = async (payload, invoiceIdToUpdate) => {
    try {
      const { status, due_date, invoice_content, recipient, invoice_date } =
        payload;
      const invoice = await Invoice.findById(invoiceIdToUpdate).populate(
        "status"
      );
      if (invoice.status.name === "draft") {
        if (status === "draft" || status === "unpaid") {
          // Get Invoice status
          const getInvoiceStatus = await Invoice_Status_Master.findOne({
            name: status,
          });

          await Invoice.updateOne(
            { _id: invoiceIdToUpdate },
            { $set: { status: getInvoiceStatus._id } }
          );
        }
        if (due_date || invoice_content || recipient || invoice_date) {
          const invoiceItems = invoice_content;
          calculateAmount(invoiceItems);

          const { total, sub_total } = calculateInvoice(invoiceItems);

          await Invoice.updateOne(
            { _id: invoiceIdToUpdate },
            {
              $set: {
                total,
                sub_total,
                due_date,
                invoice_content: invoiceItems,
                recipient,
                invoice_date,
              },
            }
          );
        }
      } else {
        return throwError(returnMessage("invoice", "canNotUpdate"));
      }
      return true;
    } catch (error) {
      logger.error(`Error while updating Invoice, ${error}`);
      throwError(error?.message, error?.statusCode);
    }
  };

  // Update Status Invoice   ------   AGENCY API
  updateStatusInvoice = async (payload, invoiceIdToUpdate) => {
    try {
      const { status } = payload;

      if (
        status === "draft" ||
        status === "unpaid" ||
        status === "paid" ||
        status === "overdue"
      ) {
        // Get Invoice status
        const getInvoiceStatus = await Invoice_Status_Master.findOne({
          name: status,
        });
        await Invoice.updateOne(
          { _id: invoiceIdToUpdate },
          { $set: { status: getInvoiceStatus._id } }
        );
      }
      return true;
    } catch (error) {
      logger.error(`Error while updating  Invoice status, ${error}`);
      throwError(error?.message, error?.statusCode);
    }
  };

  // Delete Invoice  ------   AGENCY API
  deleteInvoice = async (payload) => {
    try {
      const invoiceIdToDelete = payload;
      const invoice = await Invoice.findOne({
        _id: invoiceIdToDelete,
      }).populate("status", "name");

      if (invoice.status.name === "draft") {
        await Invoice.updateOne(
          { _id: invoiceIdToDelete },
          { $set: { is_deleted: true } }
        );
        return true;
      } else {
        return throwError(returnMessage("invoice", "canNotDelete"));
      }
    } catch (error) {
      logger.error(`Error while Deleting Invoice, ${error}`);
      throwError(error?.message, error?.statusCode);
    }
  };

  // GET All Invoice    ------   CLient API
  getClientInvoice = async (searchObj, user_id) => {
    try {
      const { agency_id } = searchObj;
      if (!agency_id) {
        return throwError(returnMessage("invoice", "agencyIdRequired"));
      }
      const queryObj = {
        is_deleted: false,
        recipient: user_id,
        agency_id: new ObjectId(agency_id),
      };
      if (searchObj.search && searchObj.search !== "") {
        queryObj["$or"] = [
          {
            invoice_number: {
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
        if (keywordType === "number") {
          const numericKeyword = parseInt(searchObj.search);
          queryObj["$or"].push({
            total: numericKeyword,
          });
        }
      }

      const pagination = paginationObject(searchObj);
      const pipeLine = [
        {
          $match: {
            ...queryObj,
          },
        },
        {
          $lookup: {
            from: "invoice_status_masters",
            localField: "status",
            foreignField: "_id",
            as: "statusArray",
            pipeline: [{ $project: { name: 1 } }],
          },
        },
        {
          $unwind: "$statusArray",
        },
        {
          $match: {
            "statusArray.name": { $ne: "draft" }, // Exclude documents with status "draft"
          },
        },
        {
          $project: {
            _id: 1,
            invoice_number: 1,
            recipient: 1,
            due_date: 1,
            invoice_date: 1,
            status: "$statusArray.name",
            agency_id: 1,
            invoice_content: 1,
            sub_total: 1,
            total: 1,
            createdAt: 1,
            updatedAt: 1,
          },
        },
      ];

      const [invoiceList, total_invoices] = await Promise.all([
        Invoice.aggregate(pipeLine)
          .sort(pagination.sort)
          .skip(pagination.skip)
          .limit(pagination.resultPerPage),
        Invoice.aggregate(pipeLine),
      ]);

      return {
        invoiceList,
        page_count:
          Math.ceil(total_invoices.length / pagination.resultPerPage) || 0,
      };
    } catch (error) {
      logger.error(`Error while Lising ALL Invoice Listing, ${error}`);
      throwError(error?.message, error?.statusCode);
    }
  };

  // Send Invoice

  sendInvoice = async (payload) => {
    try {
      const { invoice_id } = payload;

      const invoice = await Invoice.findOne({
        _id: invoice_id,
        is_deleted: false,
      })
        .populate("recipient")
        .populate("agency_id");

      const clientDetails = await Authentication.findOne({
        reference_id: invoice.recipient,
      });

      // Use a template or format the invoice message accordingly
      const formattedMessage = `Invoice Details:\n${JSON.stringify(
        invoice,
        null,
        2
      )}`;

      await sendEmail({
        email: clientDetails?.email,
        subject: "Invoice",
        message: formattedMessage,
      });

      return true;
    } catch (error) {
      logger.error(`Error while send Invoice, ${error}`);
      throwError(error?.message, error?.statusCode);
    }
  };
}

module.exports = InvoiceService;
