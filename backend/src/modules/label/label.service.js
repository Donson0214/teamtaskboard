const prisma = require("../../libs/prisma");
const { Prisma } = require("@prisma/client");
const { PrismaClientKnownRequestError } = Prisma;
const {
  requireWorkspaceMember,
  requireWorkspaceEditor,
  requireTaskAccess,
} = require("../../utils/permissions");

const PRIORITY_LABELS = [
  { name: "Urgent", color: "#ef4444" },
  { name: "High", color: "#f97316" },
  { name: "Medium", color: "#3b82f6" },
  { name: "Low", color: "#6366f1" },
];

async function ensurePriorityLabels(workspaceId) {
  const existing = await prisma.label.findMany({
    where: {
      workspaceId,
      name: { in: PRIORITY_LABELS.map((l) => l.name) },
    },
    select: { name: true, color: true },
  });

  const existingMap = new Map(existing.map((l) => [l.name, l.color]));

  // Create any missing labels, skipping duplicates if another request raced us.
  const missing = PRIORITY_LABELS.filter((l) => !existingMap.has(l.name));
  for (const label of missing) {
    try {
      await prisma.label.create({ data: { ...label, workspaceId } });
    } catch (err) {
      // Ignore duplicate insert races on unique (workspaceId, name)
      if (err?.code !== "P2002") throw err;
    }
  }

  // Refresh existing after createMany to get latest colors and update if needed.
  const afterCreate = await prisma.label.findMany({
    where: {
      workspaceId,
      name: { in: PRIORITY_LABELS.map((l) => l.name) },
    },
    select: { id: true, name: true, color: true },
  });
  for (const label of PRIORITY_LABELS) {
    const dbLabel = afterCreate.find((l) => l.name === label.name);
    if (dbLabel && dbLabel.color !== label.color) {
      await prisma.label.update({
        where: { id: dbLabel.id },
        data: { color: label.color },
      });
    }
  }
}

async function loadWorkspace(workspaceId) {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { id: true, ownerId: true },
  });
  if (!workspace) {
    const err = new Error("Workspace not found");
    err.status = 404;
    throw err;
  }
  return workspace;
}

module.exports = {
  ensurePriorityLabels,
  async listByWorkspace(workspaceId, userId) {
    await loadWorkspace(workspaceId);
    await requireWorkspaceMember(workspaceId, userId);
    await ensurePriorityLabels(workspaceId);

    const labels = await prisma.label.findMany({
      where: { workspaceId },
      orderBy: { name: "asc" },
    });

    return {
      success: true,
      message: "Labels loaded",
      data: labels,
    };
  },

  async createLabel(workspaceId, userId, data) {
    await loadWorkspace(workspaceId);
    await requireWorkspaceEditor(workspaceId, userId);

    const label = await prisma.label.upsert({
      where: { workspaceId_name: { workspaceId, name: data.name } },
      update: { color: data.color },
      create: { ...data, workspaceId },
    });

    return {
      success: true,
      message: "Label created",
      data: label,
    };
  },

  async updateLabel(labelId, userId, data) {
    const label = await prisma.label.findUnique({
      where: { id: labelId },
      include: { workspace: true },
    });
    if (!label) {
      const err = new Error("Label not found");
      err.status = 404;
      throw err;
    }

    await requireWorkspaceEditor(label.workspaceId, userId);

    const updated = await prisma.label.update({
      where: { id: labelId },
      data,
    });

    return {
      success: true,
      message: "Label updated",
      data: updated,
    };
  },

  async deleteLabel(labelId, userId) {
    const label = await prisma.label.findUnique({
      where: { id: labelId },
    });
    if (!label) {
      const err = new Error("Label not found");
      err.status = 404;
      throw err;
    }

    await requireWorkspaceEditor(label.workspaceId, userId);

    await prisma.label.delete({ where: { id: labelId } });

    return { success: true, message: "Label deleted" };
  },

  async assignLabel(taskId, labelId, userId) {
    const task = await requireTaskAccess(taskId, userId);
    const label = await prisma.label.findUnique({
      where: { id: labelId },
    });

    if (!label) {
      const err = new Error("Label not found");
      err.status = 404;
      throw err;
    }

    if (label.workspaceId !== task.workspaceId) {
      const err = new Error("Label and task must belong to the same workspace");
      err.status = 400;
      throw err;
    }

    await requireWorkspaceEditor(task.workspaceId, userId);

    await prisma.taskLabel.upsert({
      where: { taskId_labelId: { taskId, labelId } },
      update: {},
      create: { taskId, labelId },
    });

    return { success: true, message: "Label assigned", data: label };
  },

  async removeLabel(taskId, labelId, userId) {
    const task = await requireTaskAccess(taskId, userId);
    await requireWorkspaceEditor(task.workspaceId, userId);

    await prisma.taskLabel.deleteMany({
      where: { taskId, labelId },
    });

    return { success: true, message: "Label removed" };
  },
};
