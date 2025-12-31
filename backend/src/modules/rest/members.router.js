const router = require("express").Router();
const { z } = require("zod");

const prisma = require("../../libs/prisma");
const errorHandler = require("../../utils/errorHandler");
const { validate, validateQuery } = require("../../utils/validator");
const {
  inviteMemberSchema,
  updateMemberByEmailSchema,
  removeMemberSchema,
  respondInviteSchema,
} = require("../workspace/workspace.validation");
const {
  requireWorkspaceMember,
  requireWorkspaceOwner,
} = require("../../utils/permissions");
const notificationService = require("../notification/notification.service");

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format");
const workspaceQuerySchema = z.object({ workspaceId: objectId });
const workspaceBodySchema = z.object({ workspaceId: objectId });

router.get("/", async (req, res) => {
  try {
    const { workspaceId } = validateQuery(workspaceQuerySchema, req.query);
    await requireWorkspaceMember(workspaceId, req.user.id);

    const members = await prisma.workspaceMember.findMany({
      where: { workspaceId },
      include: { user: true },
      orderBy: { createdAt: "asc" },
    });

    res.json({ success: true, data: members });
  } catch (err) {
    errorHandler(res, err);
  }
});

router.post("/", async (req, res) => {
  try {
    const { workspaceId, ...rest } = validate(
      inviteMemberSchema.extend({ workspaceId: objectId }),
      req.body
    );
    await requireWorkspaceOwner(workspaceId, req.user.id);

    const { email, role, name } = rest;
    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.upsert({
      where: { email: normalizedEmail },
      update: { name: name || undefined },
      create: { email: normalizedEmail, name },
    });

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

    res.json({ success: true, message: "Invitation sent" });
  } catch (err) {
    errorHandler(res, err);
  }
});

router.post("/accept", async (req, res) => {
  try {
    const { workspaceId } = validate(workspaceBodySchema, req.body || {});
    const { role } = validate(respondInviteSchema, req.body || {});

    const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
    if (!workspace) return res.status(404).json({ error: "Workspace not found" });

    const member = await prisma.workspaceMember.upsert({
      where: {
        workspaceId_userId: { workspaceId, userId: req.user.id },
      },
      update: { role },
      create: {
        workspaceId,
        userId: req.user.id,
        role,
      },
      include: { user: true },
    });

    res.json({ success: true, data: member });
  } catch (err) {
    errorHandler(res, err);
  }
});

router.post("/decline", async (req, res) => {
  try {
    const { workspaceId } = validate(workspaceBodySchema, req.body || {});
    const { role } = validate(respondInviteSchema, req.body || {});
    const roleLabel = role ? role.toLowerCase() : "member";

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
    errorHandler(res, err);
  }
});

router.patch("/", async (req, res) => {
  try {
    const { workspaceId, email, role } = validate(
      updateMemberByEmailSchema.extend({ workspaceId: objectId }),
      req.body
    );
    await requireWorkspaceOwner(workspaceId, req.user.id);

    const normalizedEmail = email.trim().toLowerCase();

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
      data: { role },
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
    errorHandler(res, err);
  }
});

router.delete("/", async (req, res) => {
  try {
    const { workspaceId, email } = validate(
      removeMemberSchema.extend({ workspaceId: objectId }),
      req.body
    );
    await requireWorkspaceOwner(workspaceId, req.user.id);

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

    const service = require("../workspace/workspace.service");
    await service.removeMember(workspaceId, membership.id, req.user.id);

    res.json({ success: true, message: "Member removed" });
  } catch (err) {
    errorHandler(res, err);
  }
});

module.exports = router;
