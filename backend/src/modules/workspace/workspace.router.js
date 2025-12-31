const express = require("express");
const router = express.Router({ mergeParams: true });

const prisma = require("../../libs/prisma");
const { requireAuth } = require("../../middleware/auth");
const { validate } = require("../../utils/validator");

const {
  workspaceMemberMiddleware,
  workspaceOwnerMiddleware,
} = require("../../utils/permissions");

const notificationService = require("../notification/notification.service");
const { cascadeDeleteWorkspace } = require("../../utils/cascadeDelete");
const {
  createWorkspaceSchema,
  updateWorkspaceSchema,
  inviteMemberSchema,
  updateMemberByEmailSchema,
  removeMemberSchema,
  respondInviteSchema,
} = require("./workspace.validation");

const boardRouter = require("../board/board.router");

const INVITABLE_ROLES = new Set(["MEMBER", "GUEST"]);

function normalizeInvitedRole(rawRole, fallback = "MEMBER") {
  if (rawRole === undefined || rawRole === null) return fallback;
  const normalized = String(rawRole).trim().toUpperCase();
  if (!normalized) return fallback;
  if (!INVITABLE_ROLES.has(normalized)) return null;
  return normalized;
}


router.use("/:workspaceId/board", workspaceMemberMiddleware, boardRouter);

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

router.post("/", async (req, res) => {
  try {
    const { name } = validate(createWorkspaceSchema, req.body);
    const userId = req.user.id;

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

router.post(
  "/:workspaceId/members",
  workspaceOwnerMiddleware,
  async (req, res) => {
    try {
      const { workspaceId } = req.params;
      const { email, role, name } = validate(inviteMemberSchema, req.body);

      const normalizedEmail = email.trim().toLowerCase();
      const normalizedRole = normalizeInvitedRole(role, null);
      if (!normalizedRole) {
        return res.status(400).json({ error: "Invalid role" });
      }

      const user = await prisma.user.upsert({
        where: { email: normalizedEmail },
        update: { name: name || undefined },
        create: { email: normalizedEmail, name },
      });

      try {
        const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
        await notificationService.notifyUser(
          user.id,
          `You were invited as ${normalizedRole.toLowerCase()} to workspace "${workspace?.name || "workspace"}".`,
          null,
          workspaceId,
          { skipWorkspaceBroadcast: true, actorId: req.user.id }
        );
      } catch (err) {
        console.warn("Invite notification failed:", err.message);
      }

      res.json({ success: true, message: "Invitation sent" });
    } catch (err) {
      console.error("Error inviting member:", err);
      res.status(500).json({ error: "Failed to add member" });
    }
  }
);

router.post("/:workspaceId/members/accept", requireAuth, async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { role } = validate(respondInviteSchema, req.body || {});
    const normalizedRole = normalizeInvitedRole(role, "MEMBER");
    if (!normalizedRole) return res.status(400).json({ error: "Invalid role" });

    const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
    if (!workspace) return res.status(404).json({ error: "Workspace not found" });

    const member = await prisma.workspaceMember.upsert({
      where: {
        workspaceId_userId: { workspaceId, userId: req.user.id },
      },
      update: { role: normalizedRole },
      create: {
        workspaceId,
        userId: req.user.id,
        role: normalizedRole,
      },
      include: { user: true },
    });

    res.json({ success: true, data: member });
  } catch (err) {
    console.error("Error accepting invite:", err);
    res.status(500).json({ error: "Failed to accept invite" });
  }
});

router.post("/:workspaceId/members/decline", requireAuth, async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { role } = validate(respondInviteSchema, req.body || {});
    const normalizedRole = normalizeInvitedRole(role, "MEMBER");
    const roleLabel = normalizedRole ? normalizedRole.toLowerCase() : "member";

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: { owner: true },
    });

    if (!workspace) {
      return res.status(404).json({ error: "Workspace not found" });
    }

    const actor = await prisma.user.findUnique({ where: { id: req.user.id } });
    const actorName = actor?.name || actor?.email || "A user";
    const workspaceName = workspace?.name || "workspace";
    const message = `${actorName} declined the workspace invitation as ${roleLabel} for "${workspaceName}".`;

    if (workspace.ownerId) {
      try {
        await notificationService.notifyUser(
          workspace.ownerId,
          message,
          null,
          workspaceId,
          { skipWorkspaceBroadcast: true, actorId: req.user.id }
        );
      } catch (err) {
        console.warn("Invite decline notification failed:", err.message);
      }
    }

    res.json({ success: true, message: "Invitation declined" });
  } catch (err) {
    console.error("Error declining invite:", err);
    res.status(500).json({ error: "Failed to decline invite" });
  }
});

router.patch("/:workspaceId/members", workspaceOwnerMiddleware, async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { email, role } = validate(updateMemberByEmailSchema, req.body);

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedRole = normalizeInvitedRole(role, null);
    if (!normalizedRole) {
      return res.status(400).json({ error: "Invalid role" });
    }

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { ownerId: true, name: true },
    });
    if (!workspace) return res.status(404).json({ error: "Workspace not found" });

    const membership = await prisma.workspaceMember.findFirst({
      where: { workspaceId, user: { email: normalizedEmail } },
    });

    if (!membership) return res.status(404).json({ error: "Member not found" });
    if (membership.userId === workspace.ownerId) {
      return res.status(400).json({ error: "Cannot change workspace owner role" });
    }

    const updated = await prisma.workspaceMember.update({
      where: { id: membership.id },
      data: { role: normalizedRole },
      include: { user: true },
    });

    try {
      const workspaceName = workspace?.name || "workspace";
      const roleLabel = String(updated.role || role).toLowerCase();
      const message =
        roleLabel === "guest"
          ? `You are now a guest in workspace "${workspaceName}".`
          : `You are now a member of the workspace "${workspaceName}".`;
      await notificationService.notifyUser(
        updated.userId,
        message,
        null,
        workspaceId,
        { skipWorkspaceBroadcast: true, actorId: req.user.id }
      );
    } catch (err) {
      console.warn("Role change notification failed:", err.message);
    }

    res.json({ success: true, data: updated });
  } catch (err) {
    console.error("Error updating member:", err);
    res.status(500).json({ error: "Failed to update member" });
  }
});

router.delete("/:workspaceId/members", workspaceOwnerMiddleware, async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { email } = validate(removeMemberSchema, req.body);

    const normalizedEmail = email.trim().toLowerCase();

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { ownerId: true },
    });
    if (!workspace) return res.status(404).json({ error: "Workspace not found" });

    const membership = await prisma.workspaceMember.findFirst({
      where: { workspaceId, user: { email: normalizedEmail } },
    });

    if (!membership) return res.status(404).json({ error: "Member not found" });
    if (membership.userId === workspace.ownerId) {
      return res.status(400).json({ error: "Cannot remove workspace owner" });
    }

    const service = require("./workspace.service");
    await service.removeMember(workspaceId, membership.id, req.user.id);

    res.json({ success: true, message: "Member removed" });
  } catch (err) {
    console.error("Error removing member:", err);
    res.status(500).json({ error: "Failed to remove member" });
  }
});

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

router.patch("/:id", workspaceOwnerMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = validate(updateWorkspaceSchema, req.body);

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
