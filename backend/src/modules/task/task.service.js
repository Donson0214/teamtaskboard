const prisma = require("../../libs/prisma");

const { auditLog } = require("../../utils/audit");
const {
  requireBoardAccess,
  requireColumnAccess,
  requireTaskAccess,
  requireWorkspaceEditor,
} = require("../../utils/permissions");

const { emitToWorkspace } = require("../../realtime/socket");
const notificationService = require("../notification/notification.service");


const taskInclude = {
  assignee: true,
  comments: { include: { user: true }, orderBy: { createdAt: "asc" } },
  attachments: true,
  taskLabels: { include: { label: true } },
};

const shapeTask = (task) => ({
  ...task,
  labels: (task.taskLabels || [])
    .map((tl) => tl.label)
    .filter(Boolean),
});

module.exports = {
  
  createTask: async (workspaceId, columnId, userId, data) => {
    await requireWorkspaceEditor(workspaceId, userId);
    

    const column = await prisma.column.findUnique({ where: { id: columnId } });
    if (!column || column.workspaceId !== workspaceId) {
      const err = new Error("Column not found");
      err.status = 404;
      throw err;
    }

    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description ?? null,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        priority: data.priority ?? null,
        assigneeId: data.assigneeId ?? null,
        workspaceId,
        boardId: column.boardId,
        columnId,
      },
      include: taskInclude,
    });

    await auditLog(
      userId,
      workspaceId,
      "CREATE_TASK",
      JSON.stringify({ taskId: task.id, title: task.title })
    );

    if (data.assigneeId && data.assigneeId !== userId) {
      await notificationService.notifyTaskAssigned(task, data.assigneeId, userId);
    }

    emitToWorkspace(workspaceId, "task:created", { task: shapeTask(task) });

    return {
      success: true,
      message: "Task created",
      data: shapeTask(task),
    };
  },

  
  getColumnTasks: async (workspaceId, columnId, userId) => {
    const column = await requireColumnAccess(columnId, userId);
    if (column.workspaceId !== workspaceId) {
      const err = new Error("Column does not belong to this workspace");
      err.status = 400;
      throw err;
    }

    const tasks = await prisma.task.findMany({
      where: { columnId },
      include: taskInclude,
      orderBy: { createdAt: "asc" },
    });

    return {
      success: true,
      message: "Tasks loaded",
      data: tasks.map(shapeTask),
    };
  },

  
  updateTask: async (taskId, userId, data) => {
    const task = await requireTaskAccess(taskId, userId);
    await requireWorkspaceEditor(task.workspaceId, userId);

    const previousAssignee = task.assigneeId;

    const updateData = { ...data };

    
    if (Object.prototype.hasOwnProperty.call(data, "dueDate")) {
      updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    }

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: updateData,
      include: taskInclude,
    });

    await auditLog(
      userId,
      task.workspaceId,
      "UPDATE_TASK",
      JSON.stringify({ taskId })
    );

    if (
      data.assigneeId &&
      data.assigneeId !== previousAssignee &&
      data.assigneeId !== userId
    ) {
      await notificationService.notifyTaskAssigned(updated, data.assigneeId, userId);
    }

    return {
      success: true,
      message: "Task updated",
      data: shapeTask(updated),
    };
  },

  
  moveTask: async (taskId, userId, targetColumnId) => {
    const task = await requireTaskAccess(taskId, userId);
    await requireWorkspaceEditor(task.workspaceId, userId);

    const targetColumn = await prisma.column.findUnique({
      where: { id: targetColumnId },
    });

    if (!targetColumn || targetColumn.workspaceId !== task.workspaceId) {
      throw {
        status: 400,
        message: "Target column not found or belongs to another workspace",
      };
    }

    if (targetColumn.boardId !== task.boardId) {
      throw {
        status: 400,
        message: "Cannot move task to a column on another board",
      };
    }

    const oldColumn = task.columnId;

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: { columnId: targetColumnId, boardId: targetColumn.boardId },
    });

    await auditLog(
      userId,
      task.workspaceId,
      "MOVE_TASK",
      JSON.stringify({
        taskId,
        fromColumn: oldColumn,
        toColumn: targetColumnId,
      })
    );

    emitToWorkspace(task.workspaceId, "task:moved", {
      taskId,
      fromColumn: oldColumn,
      toColumn: targetColumnId,
      toColumnTitle: targetColumn.title,
      taskTitle: task.title,
      actorId: userId,
    });

    return {
      success: true,
      message: "Task moved",
      data: updated,
    };
  },


 
  deleteTask: async (taskId, userId) => {
    const task = await requireTaskAccess(taskId, userId);
    await requireWorkspaceEditor(task.workspaceId, userId);

    // Clean up dependents to avoid FK errors
    await prisma.taskLabel.deleteMany({ where: { taskId } });
    await prisma.taskComment.deleteMany({ where: { taskId } });
    await prisma.attachment.deleteMany({ where: { taskId } });
    await prisma.notification.deleteMany({ where: { taskId } });
    await prisma.auditLog.deleteMany({ where: { taskId } });

    await prisma.task.delete({ where: { id: taskId } });

    await auditLog(
      userId,
      task.workspaceId,
      "DELETE_TASK",
      JSON.stringify({ taskId })
    );

    return {
      success: true,
      message: "Task deleted",
    };
  },

  
  addLabel: async (taskId, userId, { name, color }) => {
    const task = await requireTaskAccess(taskId, userId);
    await requireWorkspaceEditor(task.workspaceId, userId);

    const label = await prisma.label.upsert({
      where: { workspaceId_name: { workspaceId: task.workspaceId, name } },
      update: { color },
      create: { name, color, workspaceId: task.workspaceId },
    });

    await prisma.taskLabel.upsert({
      where: { taskId_labelId: { taskId, labelId: label.id } },
      update: {},
      create: { taskId, labelId: label.id },
    });

    return {
      success: true,
      message: "Label added",
      data: label,
    };
  },

  
  removeLabel: async (taskId, userId, labelId) => {
    const task = await requireTaskAccess(taskId, userId);
    await requireWorkspaceEditor(task.workspaceId, userId);

    await prisma.taskLabel.deleteMany({
      where: { taskId, labelId },
    });

    return {
      success: true,
      message: "Label removed",
    };
  },
};
