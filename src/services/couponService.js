const AdminCoupon = require("../models/adminCouponSchema");
const logger = require("../logger");
const { throwError } = require("../helpers/errorUtil");
const { returnMessage, paginationObject } = require("../utils/utils");

class CouponService {
  // Add Coupon
  addCoupon = async (payload, files) => {
    try {
      const { brand, couponCode, discountTitle, siteURL } = payload;

      let couponImageFileName;
      if (files?.fieldname === "brandLogo") {
        couponImageFileName = "uploads/" + files?.filename;
      }
      const newCoupon = new AdminCoupon({
        brand,
        couponCode,
        discountTitle,
        siteURL,
        brandLogo: couponImageFileName,
      });

      return newCoupon.save();
    } catch (error) {
      logger.error(`Error while Admin add Coupon, ${error}`);
      throwError(error?.message, error?.statusCode);
    }
  };

  // GET All FQA
  getAllCoupon = async (searchObj) => {
    try {
      const queryObj = { is_deleted: false };

      if (searchObj.search && searchObj.search !== "") {
        queryObj["$or"] = [
          {
            brand: {
              $regex: searchObj.search.toLowerCase(),
              $options: "i",
            },
          },
          {
            couponCode: {
              $regex: searchObj.search.toLowerCase(),
              $options: "i",
            },
          },
          {
            discountTitle: {
              $regex: searchObj.search.toLowerCase(),
              $options: "i",
            },
          },
          {
            siteURL: {
              $regex: searchObj.search.toLowerCase(),
              $options: "i",
            },
          },
        ];
      }

      const pagination = paginationObject(searchObj);

      const [coupon, totalcoupon] = await Promise.all([
        AdminCoupon.find(queryObj)
          .select("brand couponCode discountTitle siteURL brandLogo")
          .sort(pagination.sort)
          .skip(pagination.skip)
          .limit(pagination.result_per_page)
          .lean(),
        AdminCoupon.countDocuments(queryObj),
      ]);

      return {
        coupon,
        page_count: Math.ceil(totalcoupon / pagination.result_per_page) || 0,
      };
    } catch (error) {
      logger.error(`Error while Admin FQA Listing, ${error}`);
      throwError(error?.message, error?.statusCode);
    }
  };

  // Delete Coupon
  deleteCoupon = async (payload) => {
    const { couponIdsToDelete } = payload;
    try {
      const deletedFaqs = await AdminCoupon.updateMany(
        { _id: { $in: couponIdsToDelete } },
        { $set: { is_deleted: true } }
      );
      return deletedFaqs;
    } catch (error) {
      logger.error(`Error while Deleting FQA, ${error}`);
      throwError(error?.message, error?.statusCode);
    }
  };

  // Update Coupon
  updateCoupon = async (payload, faqId, files) => {
    try {
      const { brand, couponCode, discountTitle, siteURL } = payload;
      let couponImageFileName;
      if (files?.fieldname === "brandLogo") {
        couponImageFileName = "uploads/" + files?.filename;
      }

      const faq = await AdminCoupon.findByIdAndUpdate(
        {
          _id: faqId,
        },
        {
          brand,
          couponCode,
          discountTitle,
          siteURL,
          brandLogo: couponImageFileName,
        },
        { new: true, useFindAndModify: false }
      );
      return faq;
    } catch (error) {
      logger.error(`Error while updating FQA, ${error}`);
      throwError(error?.message, error?.statusCode);
    }
  };

  // GET Coupon
  getCoupon = async (faqId) => {
    try {
      const queryObj = { is_deleted: false };

      // if (searchObj.search && searchObj.search !== "") {
      //   queryObj["$or"] = [
      //     {
      //       brand: {
      //         $regex: searchObj.search.toLowerCase(),
      //         $options: "i",
      //       },
      //     },
      //     {
      //       discountTitle: {
      //         $regex: searchObj.search.toLowerCase(),
      //         $options: "i",
      //       },
      //     },
      //     {
      //       couponCode: {
      //         $regex: searchObj.search.toLowerCase(),
      //         $options: "i",
      //       },
      //     },
      //   ];
      // }

      const faq = await AdminCoupon.findById({
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

module.exports = CouponService;
