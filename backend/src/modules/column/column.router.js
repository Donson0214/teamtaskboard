const router = require("express").Router({ mergeParams: true });
const { requireAuth } = require("../../middleware/auth");
const controller = require("./column.controller");
const {
  requireWorkspaceMember,
  requireWorkspaceEditor,
  requireColumnAccess,
} = require("../../utils/permissions");

router.post(
  "/columns",
  requireAuth,
  async (req, res, next) => {
    try {
      await requireWorkspaceEditor(req.params.workspaceId, req.user.id);
      next();
    } catch (err) {
      res.status(err.status || 403).json({ message: err.message });
    }
  },
  controller.createColumn
);

router.get(
  "/columns",
  requireAuth,
  async (req, res, next) => {
    try {
      await requireWorkspaceMember(req.params.workspaceId, req.user.id);
      next();
    } catch (err) {
      res.status(err.status || 403).json({ message: err.message });
    }
  },
  controller.getColumns
);

router.patch(
  "/columns/:columnId",
  requireAuth,
  async (req, res, next) => {
    try {
      await requireColumnAccess(req.params.columnId, req.user.id);
      next();
    } catch (err) {
      res.status(err.status || 403).json({ message: err.message });
    }
  },
  controller.updateColumn
);

router.delete(
  "/columns/:columnId",
  requireAuth,
  async (req, res, next) => {
    try {
      await requireColumnAccess(req.params.columnId, req.user.id);
      next();
    } catch (err) {
      res.status(err.status || 403).json({ message: err.message });
    }
  },
  controller.deleteColumn
);

module.exports = router;
