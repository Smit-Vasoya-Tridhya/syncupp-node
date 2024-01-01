const {
  register,
  verify,
  login,
} = require("../controllers/teamAgencyController");

const teamAgencyRoute = require("express").Router();

// this route is used for the Team Agency Route.
teamAgencyRoute.post("/register", register);
teamAgencyRoute.post("/verify", verify);
teamAgencyRoute.post("/login", login);

module.exports = teamAgencyRoute;
