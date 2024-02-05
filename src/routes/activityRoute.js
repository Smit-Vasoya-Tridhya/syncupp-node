const { protect, authorizeRole } = require("../middlewares/authMiddleware");
const activityController = require("../controllers/activityController");
const activityRoute = require("express").Router();
activityRoute.use(protect);
activityRoute.post("/create-task", activityController.addTask);
activityRoute.get("/get-list", activityController.statusList);
activityRoute.post("/task-list", activityController.taskList);

module.exports = activityRoute;
