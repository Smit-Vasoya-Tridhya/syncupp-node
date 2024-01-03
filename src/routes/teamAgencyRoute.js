const {
  verify,
  login,
  add,
  getOne,
  deleteMember,
  getAll,
  editMember,
} = require("../controllers/teamAgencyController");
const validatorFunc = require("../utils/validatorFunction.helper");
const {
  loginTeamMemberValidator,
  verifyValidator,
  addMemberValidator,
} = require("../validators/teamAgency.validator");
const { protect } = require("../middlewares/authMiddleware");
const teamAgencyRoute = require("express").Router();

// this route is used for the Team Agency Route.

teamAgencyRoute.post("/verify", verifyValidator, validatorFunc, verify);
teamAgencyRoute.post("/login", loginTeamMemberValidator, validatorFunc, login);

teamAgencyRoute.use(protect);
teamAgencyRoute.post("/add", addMemberValidator, validatorFunc, add);
teamAgencyRoute.get("/details/:id", getOne);
teamAgencyRoute.delete("/delete/:id", deleteMember);
teamAgencyRoute.get("/getAll", getAll);
teamAgencyRoute.put("/edit/:id", editMember);

module.exports = teamAgencyRoute;
