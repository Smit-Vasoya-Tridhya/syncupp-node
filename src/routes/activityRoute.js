const { protect, authorizeRole } = require("../middlewares/authMiddleware");
const activityController = require("../controllers/activityController");
const activityRoute = require("express").Router();
activityRoute.use(protect);
activityRoute.post("/create-task", activityController.addTask);
activityRoute.get("/get-status-list", activityController.statusList);
activityRoute.post("/task-list", activityController.taskList);
activityRoute.get("/get-task/:id", activityController.fetchTask);
activityRoute.delete("/delete-task", activityController.deleteTask);
activityRoute.put("/update-task/:id", activityController.updateTask);
activityRoute.put("/update-status/:id", activityController.updateStatus);

module.exports = activityRoute;
