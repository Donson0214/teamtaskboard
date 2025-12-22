const router = require("express").Router({ mergeParams: true });
const { requireAuth } = require("../../middleware/auth");
const controller = require("./comment.controller");
const { requireTaskAccess } = require("../../utils/permissions");
const prisma = require("../../libs/prisma");


router.use(requireAuth);


router.post(
  "/tasks/:taskId/comments",
  async (req, res, next) => {
    try {
      await requireTaskAccess(req.params.taskId, req.user.id);
      next();
    } catch (err) {
      res.status(err.status || 403).json({ message: err.message });
    }
  },
  controller.createComment
);


router.get(
  "/tasks/:taskId/comments",
  async (req, res, next) => {
    try {
      await requireTaskAccess(req.params.taskId, req.user.id);
      next();
    } catch (err) {
      res.status(err.status || 403).json({ message: err.message });
    }
  },
  controller.getComments
);


router.delete(
  "/comments/:commentId",
  controller.deleteComment
);

module.exports = router;
