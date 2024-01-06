const clientRoute = require("express").Router();
const { protect } = require("../middlewares/authMiddleware");
const clientController = require("../controllers/clientController");

clientRoute.post("/verify-client", clientController.verifyClient);
clientRoute.use(protect);

module.exports = clientRoute;
