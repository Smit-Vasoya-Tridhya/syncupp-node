const {
  verify,
  login,
  add,
  getOne,
  deleteMember,
  getAll,
  editMember,
  getMember,
} = require("../controllers/teamMemberController");
const validatorFunc = require("../utils/validatorFunction.helper");
const {
  loginTeamMemberValidator,
  verifyValidator,
  addMemberValidator,
} = require("../validators/teamMember.validator");
const { protect } = require("../middlewares/authMiddleware");
const teamMemberRoute = require("express").Router();

// this route is used for the Team Agency Route.

teamMemberRoute.post("/verify", verifyValidator, validatorFunc, verify);
teamMemberRoute.post("/login", loginTeamMemberValidator, validatorFunc, login);

teamMemberRoute.use(protect);
teamMemberRoute.post("/add", addMemberValidator, validatorFunc, add);
teamMemberRoute.get("/details/:id", getMember);
teamMemberRoute.delete("/delete/:id", deleteMember);
teamMemberRoute.get("/get-all", getAll);
teamMemberRoute.put("/edit/:id", editMember);

module.exports = teamMemberRoute;