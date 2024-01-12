const Invoice = require("../models/invoiceSchema");
const Invoice_Status_Master = require("../models/masters/invoiceStatusMaster");
const logger = require("../logger");
const { throwError } = require("../helpers/errorUtil");
const { returnMessage } = require("../utils/utils");
const Client = require("../models/cllientSchema");
const { ObjectId } = require("mongodb");

const {
  paginationObject,
  getKeywordType,
  calculate,
  calculateInvoice,
} = require("./commonSevice");
const statusCode = require("../messages/english.json");

class InvoiceService {
  getClients = async (user) => {
    try {
      const pipeline = [
        { $match: { _id: user.reference_id } },
        {
          $match: {
            "agency_ids.agency_id": user._id,
            "agency_ids.status": "active",
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

  // Add   Invoice
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

      const isInvoice = await Invoice.findOne({
        invoice_number: invoice_number,
      });

      if (isInvoice) {
        return throwError(returnMessage("invoice", "invoiceNumberExists"));
      }

      const { total, sub_total } = calculateInvoice(invoice_content);

      // Get Invoice status
      const getInvoiceStatus = await Invoice_Status_Master.findOne({
        name: status,
      });
      const invoice = await Invoice.create({
        client_id,
        due_date,
        invoice_number,
        total,
        sub_total,
        invoice_content,
        recipient,
        agency_id: user_id,
        status: getInvoiceStatus._id,
      });
      return invoice;
    } catch (error) {
      logger.error(`Error while  add Invoice, ${error}`);
      throwError(returnMessage("default", "default"), error?.statusCode);
    }
  };
}

module.exports = InvoiceService;
