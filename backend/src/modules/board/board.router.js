const express = require("express");
const router = express.Router({ mergeParams: true });

const controller = require("./board.controller");
const { requireAuth } = require("../../middleware/auth");
const prisma = require("../../libs/prisma");


const {
  workspaceMemberMiddleware,
  workspaceOwnerMiddleware,
  requireWorkspaceRole,
} = require("../../utils/permissions");

// All board routes require auth
router.use(requireAuth);

// Create board
router.post("/",
  async (req, res, next) => {
    try {
      await requireWorkspaceRole(req.params.workspaceId, req.user.id, ["OWNER", "MEMBER"]);
      next();
    } catch (err) {
      res.status(err.status || 403).json({ message: err.message });
    }
  },
  controller.createBoard
);

// Get boards in workspace
router.get("/",
  workspaceMemberMiddleware,
  controller.getBoards
);

// Get single board
router.get("/:boardId",
  workspaceMemberMiddleware,
  controller.getBoardById
);

// Update board (owner only)
router.patch("/:boardId",
  async (req, res, next) => {
    try {
      await requireWorkspaceRole(req.params.workspaceId, req.user.id, ["OWNER", "MEMBER"]);
      next();
    } catch (err) {
      res.status(err.status || 403).json({ message: err.message });
    }
  },
  controller.updateBoard
);

// Delete board (owner only)
router.delete("/:boardId",
  workspaceOwnerMiddleware,
  controller.deleteBoard
);

module.exports = router;
