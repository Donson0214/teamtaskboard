const router = require("express").Router();
const { requireAuth } = require("../../middleware/auth");
const controller = require("./notification.controller");
const prisma = require("../../libs/prisma");



router.get(
  "/notifications",
  requireAuth,
  controller.getMyNotifications
);


router.put(
  "/notifications/:notificationId",
  requireAuth,
  controller.markRead
);


router.put(
  "/notifications/mark/all",
  requireAuth,
  controller.markAllRead
);

module.exports = router;
