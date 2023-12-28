const express = require("express");
require("./config/connection");
const app = express();
const dotenv = require("dotenv");
dotenv.config();
const port = process.env.PORT || 3000;
const errorHandler = require("./helpers/error");
const cors = require("cors");
const rootRoutes = require("./routes/index");
const logger = require("./logger");
const { insertData } = require("./seeder/seeder");

app.use(express.json());
app.use(cors());

app.use(rootRoutes);

// handling error from all of the route
app.use(errorHandler);

app.listen(port, async () => {
  //   await insertData();
  logger.info(`Server started at port:${port}`);
});
