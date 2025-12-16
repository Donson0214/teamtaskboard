const express = require("express");
const router = express.Router({ mergeParams: true });

const prisma = require("../../libs/prisma");

const {
  workspaceMemberMiddleware,
  workspaceOwnerMiddleware,
  requireWorkspaceRole,
} = require("../../utils/permissions");

const notificationService = require("../notification/notification.service");
const { cascadeDeleteWorkspace } = require("../../utils/cascadeDelete");

const boardRouter = require("../board/board.router");

// Board routes (your app supports many boards per workspace)
router.use("/:workspaceId/board", workspaceMemberMiddleware, boardRouter);

/* =========================
   WORKSPACES
========================= */

// GET my workspaces
router.get("/", async (req, res) => {
  try {
    const userId = req.user.id;

    const memberships = await prisma.workspaceMember.findMany({
      where: { userId },
      include: {
        workspace: {
          include: {
            members: { include: { user: true } },
          },
        },
      },
    });

    const workspaces = memberships.map((m) => m.workspace);
    res.json(workspaces);
  } catch (err) {
    console.error("Error loading workspaces:", err);
    res.status(500).json({ error: "Failed to load workspaces" });
  }
});

// CREATE workspace (NO DEFAULT BOARD, NO DEFAULT COLUMNS)
router.post("/", async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user.id;

    if (!name) {
      return res.status(400).json({ error: "Missing workspace name" });
    }

    const workspace = await prisma.workspace.create({
      data: {
        name,
        ownerId: userId,
        members: {
          create: {
            userId,
            role: "OWNER",
          },
        },
      },
      include: {
        members: { include: { user: true } },
      },
    });

    res.json(workspace);
  } catch (err) {
    console.error("Error creating workspace:", err);
    res.status(500).json({ error: "Failed to create workspace" });
  }
});

/* =========================
   MEMBERS
========================= */

// List members
router.get("/:workspaceId/members", workspaceMemberMiddleware, async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const members = await prisma.workspaceMember.findMany({
      where: { workspaceId },
      include: { user: true },
      orderBy: { createdAt: "asc" },
    });

    res.json({ success: true, data: members });
  } catch (err) {
    console.error("Error loading members:", err);
    res.status(500).json({ error: "Failed to load members" });
  }
});

// Invite member
router.post(
  "/:workspaceId/members",
  async (req, res, next) => {
    try {
      await requireWorkspaceRole(req.params.workspaceId, req.user.id, ["OWNER", "MEMBER"]);
      next();
    } catch (err) {
      return res.status(err.status || 403).json({ error: err.message });
    }
  },
  async (req, res) => {
    try {
      const { workspaceId } = req.params;
      const { email, role = "MEMBER", name = null } = req.body || {};

      if (!email) return res.status(400).json({ error: "Email is required" });

      const normalizedEmail = email.trim().toLowerCase();

      const user = await prisma.user.upsert({
        where: { email: normalizedEmail },
        update: { name: name || undefined },
        create: { email: normalizedEmail, name },
      });

      const member = await prisma.workspaceMember.upsert({
        where: {
          workspaceId_userId: { workspaceId, userId: user.id },
        },
        update: { role: role.toUpperCase() },
        create: {
          workspaceId,
          userId: user.id,
          role: role.toUpperCase(),
        },
        include: { user: true },
      });

      // notify invited user (best-effort)
      try {
      const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
      await notificationService.notifyUser(
        user.id,
        `You were invited as ${role.toLowerCase()} to workspace "${workspace?.name || "workspace"}".`,
        null,
        workspaceId,
        { skipWorkspaceBroadcast: true, actorId: req.user.id }
      );
      } catch (err) {
        console.warn("Invite notification failed:", err.message);
      }

      res.json({ success: true, data: member });
    } catch (err) {
      console.error("Error inviting member:", err);
      res.status(500).json({ error: "Failed to add member" });
    }
  }
);

// Update role
router.patch("/:workspaceId/members", workspaceOwnerMiddleware, async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { email, role } = req.body || {};
    if (!email || !role) return res.status(400).json({ error: "Email and role are required" });

    const normalizedEmail = email.trim().toLowerCase();

    const membership = await prisma.workspaceMember.findFirst({
      where: { workspaceId, user: { email: normalizedEmail } },
    });

    if (!membership) return res.status(404).json({ error: "Member not found" });

    const updated = await prisma.workspaceMember.update({
      where: { id: membership.id },
      data: { role: role.toUpperCase() },
      include: { user: true },
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    console.error("Error updating member:", err);
    res.status(500).json({ error: "Failed to update member" });
  }
});

// Remove member
router.delete("/:workspaceId/members", workspaceOwnerMiddleware, async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ error: "Email is required" });

    const normalizedEmail = email.trim().toLowerCase();

    const membership = await prisma.workspaceMember.findFirst({
      where: { workspaceId, user: { email: normalizedEmail } },
    });

    if (!membership) return res.status(404).json({ error: "Member not found" });

    const service = require("./workspace.service");
    await service.removeMember(workspaceId, membership.id, req.user.id);

    res.json({ success: true, message: "Member removed" });
  } catch (err) {
    console.error("Error removing member:", err);
    res.status(500).json({ error: "Failed to remove member" });
  }
});

// Leave workspace
router.delete("/:workspaceId/members/self", workspaceMemberMiddleware, async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const membership = await prisma.workspaceMember.findFirst({
      where: { workspaceId, userId: req.user.id },
    });

    if (!membership) return res.status(404).json({ error: "Membership not found" });

    const service = require("./workspace.service");
    await service.removeMember(workspaceId, membership.id, req.user.id);

    res.json({ success: true, message: "Left workspace" });
  } catch (err) {
    console.error("Error leaving workspace:", err);
    res.status(500).json({ error: "Failed to leave workspace" });
  }
});

/* =========================
   UPDATE / DELETE WORKSPACE
========================= */

router.patch("/:id", workspaceOwnerMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body || {};
    if (!name) return res.status(400).json({ error: "Missing workspace name" });

    const updated = await prisma.workspace.update({
      where: { id },
      data: { name },
      include: { members: { include: { user: true } } },
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    console.error("Error updating workspace:", err);
    res.status(500).json({ error: "Failed to update workspace" });
  }
});

router.delete("/:id", workspaceOwnerMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    await cascadeDeleteWorkspace(prisma, id);

    res.json({ success: true, message: "Workspace deleted" });
  } catch (err) {
    console.error("Error deleting workspace:", err);
    res.status(500).json({ error: "Failed to delete workspace" });
  }
});

module.exports = router;
