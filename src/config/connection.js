const mongoose = require("mongoose");
const logger = require("../logger");
require("dotenv").config();

const dbConnection = (uri) => {
  const db = mongoose.createConnection(uri);

  db.on("error", function (error) {
    logger.error(`MongoDB :: connection ${this.name} ${JSON.stringify(error)}`);
    db.close().catch(() =>
      logger.error(`MongoDB :: failed to close connection ${this.name}`)
    );
  });

  db.on("connected", function () {
    // mongoose.set("debug", function (col, method, query, doc) {
    //   logger.info(
    //     `MongoDB :: ${this.conn.name} ${col}.${method}(${JSON.stringify(
    //       query
    //     )},${JSON.stringify(doc)})`
    //   );
    // });
    logger.info(`MongoDB :: connected ${this.name}`);
  });

  db.on("disconnected", function () {
    logger.info(`MongoDB :: disconnected ${this.name}`);
  });

  return db;
};

const admin_connection = dbConnection(process.env.ADMIN_DB_URL);
const crm_connection = dbConnection(process.env.CRM_DB_URL);

module.exports = {
  admin_connection,
  crm_connection,
};

// function makeNewConnection(uri) {
//   const db = mongoose.createConnection(uri, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   });

//   db.on("error", function (error) {
//     console.log(`MongoDB :: connection ${this.name} ${JSON.stringify(error)}`);
//     db.close().catch(() =>
//       console.log(`MongoDB :: failed to close connection ${this.name}`)
//     );
//   });

//   db.on("connected", function () {
//     mongoose.set("debug", function (col, method, query, doc) {
//       console.log(
//         `MongoDB :: ${this.conn.name} ${col}.${method}(${JSON.stringify(
//           query
//         )},${JSON.stringify(doc)})`
//       );
//     });
//     console.log(`MongoDB :: connected ${this.name}`);
//   });

//   db.on("disconnected", function () {
//     console.log(`MongoDB :: disconnected ${this.name}`);
//   });

//   return db;
// }

// const userConnection = makeNewConnection("mongodb://127.0.0.1:27017/user");
// const todoConnection = makeNewConnection("mongodb://127.0.0.1:27017/todo");

// module.exports = {
//   userConnection,
//   todoConnection,
// };
