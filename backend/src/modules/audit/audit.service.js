const prisma = require("../../libs/prisma");

const {
  requireWorkspaceMember,
} = require("../../utils/permissions");
const { isUnknownArgumentError } = require("../../utils/prismaErrors");

const buildEmptyResponse = (page, limit) => ({
  success: true,
  message: "Board audit logs loaded",
  data: [],
  pagination: {
    total: 0,
    page,
    limit,
    pages: 0,
  },
});

const ensureTaskInBoard = async (taskId, boardId) => {
  if (!taskId) return true;
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { boardId: true },
  });
  return task?.boardId === boardId;
};

const getBoardLogsWithoutBoardField = async (board, query) => {
  const { page, limit, action, taskId, userId: filterUserId } = query;

  const isTaskInBoard = await ensureTaskInBoard(taskId, board.id);
  if (!isTaskInBoard) {
    return buildEmptyResponse(page, limit);
  }

  const columns = await prisma.column.findMany({
    where: { boardId: board.id },
    select: { id: true },
  });
  const columnFilters = columns.map((column) => ({
    details: { contains: column.id },
  }));

  const where = {
    workspaceId: board.workspaceId,
    ...(action ? { action } : {}),
    ...(taskId ? { taskId } : {}),
    ...(filterUserId ? { userId: filterUserId } : {}),
    OR: [
      { task: { boardId: board.id } },
      { details: { contains: board.id } },
      ...columnFilters,
    ],
  };

  const logs = await prisma.auditLog.findMany({
    where,
    include: {
      user: true,
      task: true,
    },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  });

  const total = await prisma.auditLog.count({ where });

  return {
    success: true,
    message: "Board audit logs loaded",
    data: logs,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
};

module.exports = {
  
  getWorkspaceLogs: async (workspaceId, userId, query) => {
    const { page, limit, action, taskId, userId: filterUserId } = query;

    await requireWorkspaceMember(workspaceId, userId);

    const where = {
      workspaceId,
      ...(action ? { action } : {}),
      ...(taskId ? { taskId } : {}),
      ...(filterUserId ? { userId: filterUserId } : {}),
    };

    const logs = await prisma.auditLog.findMany({
      where,
      include: {
        user: true,
        task: true,
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.auditLog.count({ where });

    return {
      success: true,
      message: "Workspace audit logs loaded",
      data: logs,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  },

  getBoardLogs: async (boardId, userId, query) => {
    const { page, limit, action, taskId, userId: filterUserId } = query;

    const board = await prisma.board.findUnique({
      where: { id: boardId },
      select: { id: true, workspaceId: true },
    });

    if (!board) throw new Error("Board not found");

    await requireWorkspaceMember(board.workspaceId, userId);

    const where = {
      boardId,
      ...(action ? { action } : {}),
      ...(taskId ? { taskId } : {}),
      ...(filterUserId ? { userId: filterUserId } : {}),
    };

    let logs;
    let total;
    try {
      logs = await prisma.auditLog.findMany({
        where,
        include: {
          user: true,
          task: true,
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      });

      total = await prisma.auditLog.count({ where });
    } catch (err) {
      if (isUnknownArgumentError(err, "boardId")) {
        return getBoardLogsWithoutBoardField(board, query);
      }
      throw err;
    }

    return {
      success: true,
      message: "Board audit logs loaded",
      data: logs,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  },

  
  getTaskLogs: async (taskId, userId, query) => {
    const { page, limit, action, userId: filterUserId } = query;

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { workspace: true },
    });

    if (!task) throw new Error("Task not found");

    await requireWorkspaceMember(task.workspaceId, userId);

    const where = {
      taskId,
      ...(action ? { action } : {}),
      ...(filterUserId ? { userId: filterUserId } : {}),
    };

    const logs = await prisma.auditLog.findMany({
      where,
      include: {
        user: true,
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.auditLog.count({ where });

    return {
      success: true,
      message: "Task audit logs loaded",
      data: logs,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  },
};
