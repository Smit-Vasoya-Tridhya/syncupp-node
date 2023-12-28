const fs = require("fs");
const logger = require("../logger");
const { throwError } = require("../helpers/errorUtil");
const statusCode = require("../messages/statusCodes.json");

// Load Models
const Admin = require("../models/adminSchema");

const admin_data = JSON.parse(
  fs.readFileSync(`${__dirname}/seeder-data/admin.json`, "utf-8")
);
exports.insertData = async () => {
  try {
    await Promise.all([Admin.deleteMany(), Admin.create(admin_data)]);
  } catch (error) {
    logger.error(`Error while running seeder file: ${error}`);
    return throwError(error.message, statusCode.internalServerError);
  }
};
