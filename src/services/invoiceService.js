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

class InvoiceService {
  // Get Client list  ------   AGENCY API
  getClients = async (user) => {
    try {
      const pipeline = [
        {
          $match: {
            "agency_ids.agency_id": user._id,
            "agency_ids.status": "active",
          },
        },
        {
          $project: {
            _id: 1,
            company_name: 1,
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
      const getAgencyData = await Agency.findOne({
        _id: reference_id,
      });
      const getClientData = await Client.findOne(
        {
          _id: client_id,
        },
        {
          agency_ids: 0,
        }
      );

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
        client_id,
        due_date,
        invoice_number,
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

      // Get Invoice status
      const getInvoiceStatus = await Invoice_Status_Master.findOne({
        name: status,
      });
      console.log(invoiceItems);

      const invoice = await Invoice.create({
        client_id,
        due_date,
        invoice_number,
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
          $project: {
            _id: 1,
            invoice_number: 1,
            recipient: 1,
            due_date: 1,
            status: "$status.name",
            client_id: 1,
            invoice_content: 1,
            sub_total: 1,
            total: 1,
            createdAt: 1,
            updatedAt: 1,
          },
        },
      ];

      const invoices = await Invoice.aggregate(pipeLine)
        .sort(pagination.sort)
        .skip(pagination.skip)
        .limit(pagination.resultPerPage);

      const countResult = await Invoice.aggregate(pipeLine).count("count");

      const count = countResult[0] && countResult[0].count;

      if (count !== undefined) {
        // Calculating total pages
        const pages = Math.ceil(count / pagination.resultPerPage);

        return {
          invoices,
          pagination: {
            current_page: pagination.page,
            total_pages: pages,
          },
        };
      }
      return {
        invoices,
        pagination: {
          current_page: pagination.page,
          total_pages: 0,
        },
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
          path: "client_id",
          model: "authentication",
          select: "reference_id",
          populate: {
            path: "reference_id",
            model: "client",
            select: "-agency_ids",
          },
        })
        .populate({
          path: "agency_id",
          model: "authentication",
          select: "reference_id",
          populate: {
            path: "reference_id",
            model: "agency",
          },
        });
      return invoice;
    } catch (error) {
      logger.error(`Error while Get Invoice, ${error}`);
      throwError(error?.message, error?.statusCode);
    }
  };

  // Update Invoice Status  ------   AGENCY API
  updateStatusInvoice = async (payload, invoiceIdToUpdate) => {
    try {
      const { status, due_date, invoice_content, recipient } = payload;

      if (status) {
        // Get Invoice status
        const getInvoiceStatus = await Invoice_Status_Master.findOne({
          name: status,
        });

        await Invoice.updateOne(
          { _id: invoiceIdToUpdate },
          { $set: { status: getInvoiceStatus._id } }
        );
      }
      if (due_date || invoice_content || recipient) {
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
            },
          }
        );
      }

      return true;
    } catch (error) {
      logger.error(`Error while updating Invoice, ${error}`);
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
      const queryObj = { is_deleted: false, client_id: user_id };
      if (searchObj.search && searchObj.search !== "") {
        queryObj["$or"] = [
          {
            invoice_number: {
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
          $project: {
            _id: 1,
            invoice_number: 1,
            recipient: 1,
            due_date: 1,
            status: "$status.name",
            client_id: 1,
            invoice_content: 1,
            sub_total: 1,
            total: 1,
            createdAt: 1,
            updatedAt: 1,
          },
        },
      ];

      const invoices = await Invoice.aggregate(pipeLine)
        .sort(pagination.sort)
        .skip(pagination.skip)
        .limit(pagination.resultPerPage);

      const countResult = await Invoice.aggregate(pipeLine).count("count");

      const count = countResult[0] && countResult[0].count;

      if (count !== undefined) {
        // Calculating total pages
        const pages = Math.ceil(count / pagination.resultPerPage);

        return {
          invoices,
          pagination: {
            current_page: pagination.page,
            total_pages: pages,
          },
        };
      }
      return {
        invoices,
        pagination: {
          current_page: pagination.page,
          total_pages: 0,
        },
      };
    } catch (error) {
      logger.error(`Error while Lising ALL Invoice Listing, ${error}`);
      throwError(error?.message, error?.statusCode);
    }
  };
}

module.exports = InvoiceService;
