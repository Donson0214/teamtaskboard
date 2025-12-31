const express = require("express");
const router = express.Router({ mergeParams: true });

const controller = require("./task.controller");
const { requireAuth } = require("../../middleware/auth");


router.use(requireAuth);


router.post(
  "/columns/:columnId/tasks",
  controller.createTask
);


router.get(
  "/columns/:columnId/tasks",
  controller.getColumnTasks
);


router.patch(
  "/tasks/:taskId",
  controller.updateTask
);


router.put(
  "/tasks/:taskId/move",
  controller.moveTask
);


router.delete(
  "/tasks/:taskId",
  controller.deleteTask
);


router.post(
  "/tasks/:taskId/labels",
  controller.addLabel
);

router.delete(
  "/tasks/:taskId/labels/:labelId",
  controller.removeLabel
);

module.exports = router;
