const express = require("express");
const router = express.Router({ mergeParams: true });

const controller = require("./label.controller");
const { requireAuth } = require("../../middleware/auth");

router.use(requireAuth);

router.get("/labels", controller.list);
router.post("/labels", controller.create);

router.patch("/labels/:labelId", controller.update);
router.delete("/labels/:labelId", controller.remove);

router.post("/tasks/:taskId/labels/:labelId", controller.assignToTask);
router.delete("/tasks/:taskId/labels/:labelId", controller.removeFromTask);

module.exports = router;
