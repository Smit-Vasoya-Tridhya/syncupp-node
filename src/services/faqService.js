const AdminFqa = require("../models/adminFaqSchema");
const logger = require("../logger");
const { throwError } = require("../helpers/errorUtil");
const { returnMessage } = require("../utils/utils");
const { paginationObject, getKeywordType } = require("./commonSevice");

class FaqService {
  // Add   FQA
  addFaq = async (payload) => {
    try {
      const faq = await AdminFqa.create(payload);
      return faq;
    } catch (error) {
      logger.error(`Error while Admin add FQA, ${error}`);
      throwError(error?.message, error?.statusCode);
    }
  };

  // GET All FQA
  getAllFaq = async (searchObj) => {
    try {
      const queryObj = { is_deleted: false };

      if (searchObj.search && searchObj.search !== "") {
        queryObj["$or"] = [
          {
            title: {
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

        // const keywordType = getKeywordType(searchObj.search);
        // if (keywordType === "number") {
        //   const numericKeyword = parseInt(searchObj.search);
        //   queryObj["$or"].push({
        //     contact_number: numericKeyword,
        //   });
        // }
      }

      const pagination = paginationObject(searchObj);
      const faqs = await AdminFqa.find(queryObj)
        .skip(pagination.skip)
        .limit(pagination.resultPerPage)
        .sort(pagination.sort);

      const totalFaqsCount = await AdminFqa.countDocuments(queryObj);

      // Calculating total pages
      const pages = Math.ceil(totalFaqsCount / pagination.resultPerPage);

      return {
        faqs,
        pagination: {
          current_page: pagination.page,
          total_pages: pages,
        },
      };
    } catch (error) {
      logger.error(`Error while Admin FQA Listing, ${error}`);
      throwError(error?.message, error?.statusCode);
    }
  };

  // Delete FQA
  deleteFaq = async (payload) => {
    const { faqIdsToDelete } = payload;
    try {
      const deletedFaqs = await AdminFqa.updateMany(
        { _id: { $in: faqIdsToDelete } },
        { $set: { is_deleted: true } }
      );
      return deletedFaqs;
    } catch (error) {
      logger.error(`Error while Deleting FQA, ${error}`);
      throwError(error?.message, error?.statusCode);
    }
  };

  // Add   FQA

  updateFaq = async (payload, faqId) => {
    try {
      const faq = await AdminFqa.findByIdAndUpdate(
        {
          _id: faqId,
        },
        payload,
        { new: true, useFindAndModify: false }
      );
      return faq;
    } catch (error) {
      logger.error(`Error while updating FQA, ${error}`);
      throwError(error?.message, error?.statusCode);
    }
  };
  // GET FQA

  getFaq = async (faqId) => {
    try {
      const faq = await AdminFqa.findById({
        _id: faqId,
        is_deleted: false,
      }).lean();
      return faq;
    } catch (error) {
      logger.error(`Error while Get FQA, ${error}`);
      throwError(error?.message, error?.statusCode);
    }
  };
}

module.exports = FaqService;
