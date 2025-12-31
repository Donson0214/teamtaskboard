
const prisma = require("../../libs/prisma");
const { auditLog } = require("../../utils/audit");
const { cascadeDeleteWorkspace } = require("../../utils/cascadeDelete");
const notificationService = require("../notification/notification.service");

module.exports.createWorkspace = async (userId, data) => {
  const workspace = await prisma.workspace.create({
    data: {
      name: data.name,
      ownerId: userId,
      members: {
        create: {
          userId,
          role: "OWNER",
        },
      },
    },
  });

  await auditLog(userId, workspace.id, "WORKSPACE_CREATED", {
    name: workspace.name,
  });

  return workspace;
};


module.exports.getMyWorkspaces = (userId) => {
  return prisma.workspace.findMany({
    where: {
      members: {
        some: { userId },
      },
    },
  });
};


module.exports.getWorkspaceById = (workspaceId, userId) => {
  return prisma.workspace.findFirst({
    where: {
      id: workspaceId,
      members: {
        some: { userId },
      },
    },
    include: {
      members: {
        include: { user: true },
      },
    },
  });
};


module.exports.updateWorkspace = async (workspaceId, userId, data) => {
  const updated = await prisma.workspace.update({
    where: { id: workspaceId },
    data,
  });

  await auditLog(userId, workspaceId, "WORKSPACE_UPDATED", data);

  return updated;
};


module.exports.deleteWorkspace = async (workspaceId, userId) => {
  await cascadeDeleteWorkspace(prisma, workspaceId);
};


module.exports.addMember = async (workspaceId, inviterId, data) => {
  const member = await prisma.workspaceMember.create({
    data: {
      workspaceId,
      userId: data.userId,
      role: data.role,
    },
  });

  await auditLog(inviterId, workspaceId, "MEMBER_ADDED", {
    userId: data.userId,
    role: data.role,
  });

  
  try {
    await notificationService.notifyUser(
      data.userId,
      `You were invited as a ${data.role} to a workspace.`,
      null,
      workspaceId,
      { skipWorkspaceBroadcast: true, actorId: inviterId }
    );
  } catch (err) {
    console.warn("Notify invited member failed:", err.message);
  }

  return member;
};


module.exports.updateMemberRole = async (workspaceId, memberId, userId, data) => {
  const member = await prisma.workspaceMember.update({
    where: { id: memberId },
    data: { role: data.role },
  });

  await auditLog(userId, workspaceId, "MEMBER_ROLE_UPDATED", {
    memberId,
    newRole: data.role,
  });

  return member;
};


module.exports.removeMember = async (workspaceId, memberId, userId) => {
  const memberToRemove = await prisma.workspaceMember.findUnique({
    where: { id: memberId },
    include: { user: true },
  });

  if (!memberToRemove) {
    const err = new Error("Member not found");
    err.status = 404;
    throw err;
  }

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: { owner: true, members: { include: { user: true } } },
  });

  await prisma.workspaceMember.delete({
    where: { id: memberId },
  });

  await auditLog(userId, workspaceId, "MEMBER_REMOVED", {
    memberId,
  });

  if (memberToRemove.userId && memberToRemove.userId !== userId) {
    try {
      const actor = await prisma.user.findUnique({ where: { id: userId } });
      const actorName =
        actor?.name || actor?.email || workspace?.owner?.name || workspace?.owner?.email || "Workspace owner";
      const workspaceName = workspace?.name || "workspace";
      await notificationService.notifyUser(
        memberToRemove.userId,
        `${actorName} removed you from the workspace "${workspaceName}".`,
        null,
        workspaceId,
        { skipWorkspaceBroadcast: true, actorId: userId }
      );
    } catch (err) {
      console.warn("Notify removed member failed:", err.message);
    }
  }

  const remainingMembers = await prisma.workspaceMember.findMany({
    where: { workspaceId },
    select: { userId: true },
  });
  const recipients = new Set(
    remainingMembers
      .map((m) => m.userId)
      .filter((id) => id !== memberToRemove.userId && id !== userId)
  );
  if (
    workspace.ownerId &&
    workspace.ownerId !== memberToRemove.userId &&
    workspace.ownerId !== userId
  ) {
    recipients.add(workspace.ownerId);
  }

  const message = `${memberToRemove.user.name || memberToRemove.user.email} left the workspace.`;

  for (const recipientId of recipients) {
    if (recipientId === memberToRemove.userId) continue; 
    try {
      await notificationService.notifyUser(
        recipientId,
        message,
        null,
        workspaceId,
        { skipWorkspaceBroadcast: true, actorId: userId }
      );
    } catch (err) {
      console.warn("Notify member on member leave failed:", err.message);
    }
  }
};
