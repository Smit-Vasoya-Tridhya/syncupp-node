const clientRoute = require("express").Router();
const { protect, authorizeRole } = require("../middlewares/authMiddleware");
const clientController = require("../controllers/clientController");

clientRoute.use(protect);
clientRoute.post(
  "/create-client",
  authorizeRole("agency"),
  clientController.createClient
);

module.exports = clientRoute;
