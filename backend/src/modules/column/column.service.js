const prisma = require("../../libs/prisma");
const { auditLog } = require("../../utils/audit");
const { emitToWorkspace, emitToBoard } = require("../../realtime/socket");
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
      "COLUMN_CREATE",
      {
        columnId: column.id,
        title: column.title,
      },
      null,
      boardId
    );

    const payload = { column, actorId: userId };
    emitToWorkspace(workspaceId, "column:created", payload);
    emitToBoard?.(boardId, "column:created", payload);

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

    const changes = {};
    if (data.title && data.title !== column.title) changes.title = data.title;
    if (data.color && data.color !== column.color) changes.color = data.color;
    if (Object.keys(changes).length) {
      await auditLog(
        userId,
        column.workspaceId,
        "COLUMN_UPDATE",
        { columnId, changes },
        null,
        column.boardId
      );
    }

    const payload = { column: updated, actorId: userId };
    emitToWorkspace(column.workspaceId, "column:updated", payload);
    emitToBoard?.(column.boardId, "column:updated", payload);

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

    const currentIndex = columns.findIndex((c) => c.id === columnId);
    if (currentIndex === -1) throw new Error("Column not found");
    const clampedOrder = Math.max(0, Math.min(newOrder, columns.length - 1));

    const reordered = columns.filter((c) => c.id !== columnId);
    reordered.splice(clampedOrder, 0, columns[currentIndex]);

    const updates = await Promise.all(
      reordered.map((c, index) =>
        prisma.column.update({
          where: { id: c.id },
          data: { order: index },
        })
      )
    );

    await auditLog(
      userId,
      column.workspaceId,
      "COLUMN_REORDER",
      { columnId, from: currentIndex, to: clampedOrder },
      null,
      column.boardId
    );

    const payload = {
      boardId: column.boardId,
      columns: updates.map((c) => ({ id: c.id, order: c.order })),
      actorId: userId,
    };
    emitToWorkspace(column.workspaceId, "columns:reordered", payload);
    emitToBoard?.(column.boardId, "columns:reordered", payload);

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

    await auditLog(
      userId,
      column.workspaceId,
      "COLUMN_DELETE",
      { columnId, title: column.title },
      null,
      column.boardId
    );

    const payload = {
      columnId,
      boardId: column.boardId,
      actorId: userId,
    };
    emitToWorkspace(column.workspaceId, "column:deleted", payload);
    emitToBoard?.(column.boardId, "column:deleted", payload);

    return { success: true };
  },
};
