const prisma = require("../../libs/prisma");
const { auditLog } = require("../../utils/audit");
const {
  requireWorkspaceMember,
  requireWorkspaceEditor,
} = require("../../utils/permissions");

module.exports = {
  /**
   * CREATE COLUMN
   * ✅ boardId REQUIRED
   */
  createColumn: async (workspaceId, boardId, userId, data) => {
    await requireWorkspaceEditor(workspaceId, userId);

    const board = await prisma.board.findUnique({ where: { id: boardId } });
    if (!board || board.workspaceId !== workspaceId) {
      const err = new Error("Board not found");
      err.status = 404;
      throw err;
    }

    const max = await prisma.column.aggregate({
      where: { workspaceId, boardId },
      _max: { order: true },
    });

    const nextOrder = (max._max.order ?? -1) + 1;

    const column = await prisma.column.create({
      data: {
        title: data.title,
        color: data.color || "#6366f1",
        workspaceId,
        boardId,
        order: nextOrder,
      },
    });

    await auditLog(
      userId,
      workspaceId,
      "CREATE_COLUMN",
      JSON.stringify({
        columnId: column.id,
        title: column.title,
      })
    );

    return { success: true, data: column };
  },

  /**
   * GET COLUMNS (BOARD SCOPED)
   */
  getColumns: async (workspaceId, boardId, userId) => {
    await requireWorkspaceMember(workspaceId, userId);

    const columns = await prisma.column.findMany({
      where: { workspaceId, boardId },
      orderBy: { order: "asc" },
    });

    return { success: true, data: columns };
  },

  /**
   * UPDATE COLUMN
   */
  updateColumn: async (columnId, userId, data) => {
    const column = await prisma.column.findUnique({
      where: { id: columnId },
    });

    if (!column) throw new Error("Column not found");

    await requireWorkspaceEditor(column.workspaceId, userId);

    const updated = await prisma.column.update({
      where: { id: columnId },
      data: {
        title: data.title,
        color: data.color || column.color,
      },
    });

    return { success: true, data: updated };
  },

  /**
   * REORDER COLUMN
   */
  reorderColumn: async (columnId, userId, newOrder) => {
    const column = await prisma.column.findUnique({
      where: { id: columnId },
    });

    if (!column) throw new Error("Column not found");

    await requireWorkspaceEditor(column.workspaceId, userId);

    const columns = await prisma.column.findMany({
      where: { boardId: column.boardId },
      orderBy: { order: "asc" },
    });

    const reordered = columns
      .map((c) => (c.id === columnId ? { ...c, order: newOrder } : c))
      .sort((a, b) => a.order - b.order)
      .map((c, index) => ({ id: c.id, order: index }));

    await Promise.all(
      reordered.map((c) =>
        prisma.column.update({
          where: { id: c.id },
          data: { order: c.order },
        })
      )
    );

    return { success: true };
  },

  /**
   * DELETE COLUMN
   */
  deleteColumn: async (columnId, userId) => {
    const column = await prisma.column.findUnique({
      where: { id: columnId },
      include: { tasks: true },
    });

    if (!column) throw new Error("Column not found");

    await requireWorkspaceEditor(column.workspaceId, userId);

    if (column.tasks.length > 0) {
      throw new Error("Cannot delete column with tasks");
    }

    await prisma.column.delete({
      where: { id: columnId },
    });

    return { success: true };
  },
};
