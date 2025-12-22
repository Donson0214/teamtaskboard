const prisma = require("../libs/prisma");

function throwForbidden(msg = "Forbidden") {
  const err = new Error(msg);
  err.status = 403;
  throw err;
}

function normalizeId(id) {
  if (!id) return id;
  if (typeof id === "string") return id;
  if (typeof id === "object") {
    if (id.id) return id.id.toString();
    if (id._id) return id._id.toString();
  }
  return id.toString ? id.toString() : id;
}


 
async function requireWorkspaceMember(workspaceId, userId) {
  const wsId = normalizeId(workspaceId);
  if (typeof wsId !== "string") {
    const err = new Error("Invalid workspace id");
    err.status = 400;
    throw err;
  }
  let member = await prisma.workspaceMember.findFirst({
    where: { workspaceId: wsId, userId },
  });

  
  if (!member) {
    const ws = await prisma.workspace.findUnique({ where: { id: wsId } });
    if (ws && ws.ownerId === userId) {
      member = { role: "OWNER" };
    }
  }

  if (!member) throwForbidden("You are not part of this workspace");
  return member;
}


async function requireWorkspaceRole(
  workspaceId,
  userId,
  allowedRoles = ["OWNER", "MEMBER"]
) {
  const wsId = normalizeId(workspaceId);
  if (typeof wsId !== "string") {
    const err = new Error("Invalid workspace id");
    err.status = 400;
    throw err;
  }
  let member = await prisma.workspaceMember.findFirst({
    where: { workspaceId: wsId, userId },
  });


  if (!member) {
    const ws = await prisma.workspace.findUnique({ where: { id: wsId } });
    if (ws && ws.ownerId === userId) {
      member = { role: "OWNER" };
    }
  }

  if (!member) throwForbidden("You are not part of this workspace");

  if (!allowedRoles.includes(member.role)) {
    throwForbidden("Insufficient role for this action");
  }

  return member;
}


async function requireWorkspaceOwner(workspaceId, userId) {
  const wsId = normalizeId(workspaceId);
  if (typeof wsId !== "string") {
    const err = new Error("Invalid workspace id");
    err.status = 400;
    throw err;
  }
  const ws = await prisma.workspace.findUnique({
    where: { id: wsId },
  });

  if (!ws) {
    const err = new Error("Workspace not found");
    err.status = 404;
    throw err;
  }

  if (ws.ownerId !== userId) {
    throwForbidden("Only workspace owner can perform this action");
  }

  return ws;
}


async function requireBoardAccess(workspaceId, userId) {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
  });

  if (!workspace) {
    const err = new Error("Workspace not found");
    err.status = 404;
    throw err;
  }

  await requireWorkspaceMember(workspaceId, userId);
  return workspace;
}


async function requireColumnAccess(columnId, userId) {
  const column = await prisma.column.findUnique({
    where: { id: columnId },
    include: { workspace: true },
  });

  if (!column) {
    const err = new Error("Column not found");
    err.status = 404;
    throw err;
  }

  await requireWorkspaceMember(column.workspaceId, userId);
  return column;
}


async function requireTaskAccess(taskId, userId) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      column: {
        include: {
          workspace: true,
        },
      },
      workspace: true,
    },
  });

  if (!task) {
    const err = new Error("Task not found");
    err.status = 404;
    throw err;
  }

  await requireWorkspaceMember(task.workspaceId, userId);

  return task;
}

async function requireWorkspaceEditor(workspaceId, userId) {
  return requireWorkspaceRole(workspaceId, userId, ["OWNER", "MEMBER"]);
}


async function workspaceMemberMiddleware(req, res, next) {
  try {
    const workspaceId = normalizeId(req.params.workspaceId || req.params.id);
    const userId = req.user.id;

    await requireWorkspaceMember(workspaceId, userId);
    next();
  } catch (err) {
    res.status(err.status || 403).json({ message: err.message });
  }
}

async function workspaceOwnerMiddleware(req, res, next) {
  try {
    const workspaceId = normalizeId(req.params.workspaceId || req.params.id);
    const userId = req.user.id;

    await requireWorkspaceOwner(workspaceId, userId);
    next();
  } catch (err) {
    res.status(err.status || 403).json({ message: err.message });
  }
}

module.exports = {
  throwForbidden,
  requireWorkspaceMember,
  requireWorkspaceOwner,
  requireBoardAccess,
  requireColumnAccess,
  requireTaskAccess,
  workspaceMemberMiddleware,
  workspaceOwnerMiddleware,
  requireWorkspaceRole,
  requireWorkspaceEditor,
};
