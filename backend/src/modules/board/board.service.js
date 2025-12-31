const prisma = require("../../libs/prisma");
const {
  requireWorkspaceMember,
  requireWorkspaceOwner,
  requireWorkspaceRole,
} = require("../../utils/permissions");
const { auditLog } = require("../../utils/audit");
const { cascadeDeleteBoard } = require("../../utils/cascadeDelete");

/* =========================
   DEFAULT DATA
========================= */

const DEFAULT_COLUMNS = [
  { title: "To Do", color: "#8b5cf6" },
  { title: "In Progress", color: "#f97316" },
  { title: "Done", color: "#22c55e" },
];

const PRIORITY_LABELS = [
  { name: "Urgent", color: "#ef4444" },
  { name: "High", color: "#f97316" },
  { name: "Medium", color: "#3b82f6" },
  { name: "Low", color: "#6366f1" },
];

const taskInclude = {
  assignee: true,
  taskLabels: { include: { label: true } },
  comments: { include: { user: true }, orderBy: { createdAt: "asc" } },
  attachments: true,
};

const shapeTask = (task) => ({
  ...task,
  labels: task.taskLabels.map((tl) => tl.label),
});

/* =========================
   HELPERS (WORKSPACE SAFE)
========================= */

async function ensurePriorityLabels(workspaceId) {
  for (const label of PRIORITY_LABELS) {
    const existing = await prisma.label.findFirst({
      where: {
        workspaceId,
        name: label.name,
      },
    });

    if (!existing) {
      await prisma.label.create({
        data: {
          name: label.name,
          color: label.color,
          workspaceId,
        },
      });
    }
  }
}

/* =========================
   SERVICE METHODS
========================= */

module.exports = {
  async createBoard(workspaceId, userId, data) {
    await requireWorkspaceRole(workspaceId, userId, ["OWNER", "MEMBER"]);

    const board = await prisma.board.create({
      data: {
        name: data.name,
        icon: data.icon || null,
        color: data.color || null,
        workspaceId,
      },
    });

    await Promise.all([
      ensurePriorityLabels(workspaceId),
      prisma.column.createMany({
        data: DEFAULT_COLUMNS.map((col, idx) => ({
          title: col.title,
          color: col.color,
          order: idx,
          boardId: board.id,
          workspaceId,
        })),
      }),
    ]);

    await auditLog(
      userId,
      workspaceId,
      "BOARD_CREATE",
      `Board created: ${board.name}`,
      null,
      board.id
    );

    return { success: true, data: board };
  },

  async getBoards(workspaceId, userId) {
    await requireWorkspaceMember(workspaceId, userId);

    const boards = await prisma.board.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "asc" },
    });

    return { success: true, data: boards };
  },

  async getBoardById(boardId, userId) {
    const board = await prisma.board.findUnique({
      where: { id: boardId },
      include: {
        columns: {
          orderBy: [{ order: "asc" }],
          include: {
            tasks: {
              include: taskInclude,
              orderBy: { createdAt: "asc" },
            },
          },
        },
      },
    });

    if (!board) return { success: false, message: "Board not found" };

    await requireWorkspaceMember(board.workspaceId, userId);

    const labels = await prisma.label.findMany({
      where: { workspaceId: board.workspaceId },
      orderBy: { name: "asc" },
    });

    return {
      success: true,
      data: {
        ...board,
        columns: board.columns.map((col) => ({
          ...col,
          tasks: col.tasks.map(shapeTask),
        })),
        labels,
      },
    };
  },

  async updateBoard(boardId, data, userId) {
    const board = await prisma.board.findUnique({ where: { id: boardId } });
    if (!board) return { success: false };

    await requireWorkspaceRole(board.workspaceId, userId, ["OWNER", "MEMBER"]);

    const updated = await prisma.board.update({
      where: { id: boardId },
      data,
    });

    await auditLog(
      userId,
      board.workspaceId,
      "BOARD_UPDATE",
      { boardId, updates: data },
      null,
      boardId
    );

    return { success: true, data: updated };
  },

  async deleteBoard(boardId, userId) {
    const board = await prisma.board.findUnique({ where: { id: boardId } });
    if (!board) return { success: false };

    await requireWorkspaceOwner(board.workspaceId, userId);

    await prisma.$transaction(async (tx) => {
      await cascadeDeleteBoard(tx, boardId);
    });

    await auditLog(
      userId,
      board.workspaceId,
      "BOARD_DELETE",
      { boardId },
      null,
      boardId
    );

    return { success: true };
  },
};
