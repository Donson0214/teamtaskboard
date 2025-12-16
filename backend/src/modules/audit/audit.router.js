const router = require("express").Router();
const { requireAuth } = require("../../middleware/auth");
const controller = require("./audit.controller");
const prisma = require("../../libs/prisma");



router.get(
  "/workspace/:workspaceId",
  requireAuth,
  controller.getWorkspaceLogs
);


router.get(
  "/task/:taskId",
  requireAuth,
  controller.getTaskLogs
);

module.exports = router;
