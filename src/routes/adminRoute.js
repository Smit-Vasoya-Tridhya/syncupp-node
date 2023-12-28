const adminRoute = require("express").Router();
const { login } = require("../controllers/adminController");

// this route is used for the ADMIN panel Login
adminRoute.post("/login", login);

module.exports = adminRoute;
