const prisma = require("../../libs/prisma");

const { auditLog } = require("../../utils/audit");
const {
  requireBoardAccess,
  requireColumnAccess,
  requireTaskAccess,
  requireWorkspaceEditor,
  requireWorkspaceOwner,
} = require("../../utils/permissions");

const { emitToWorkspace, emitToBoard } = require("../../realtime/socket");
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
      { taskId: task.id, title: task.title },
      task.id,
      task.boardId
    );

    if (data.assigneeId && data.assigneeId !== userId) {
      await notificationService.notifyTaskAssigned(task, data.assigneeId, userId);
    }

    const shapedTask = shapeTask(task);
    emitToWorkspace(workspaceId, "task:created", {
      task: shapedTask,
      actorId: userId,
    });
    emitToBoard?.(task.boardId, "task:created", {
      task: shapedTask,
      actorId: userId,
    });

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

  getTaskById: async (taskId, userId) => {
    await requireTaskAccess(taskId, userId);

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: taskInclude,
    });
    if (!task) {
      const err = new Error("Task not found");
      err.status = 404;
      throw err;
    }

    return {
      success: true,
      message: "Task loaded",
      data: shapeTask(task),
    };
  },

  
  updateTask: async (taskId, userId, data) => {
    const task = await requireTaskAccess(taskId, userId);
    await requireWorkspaceEditor(task.workspaceId, userId);

    const previousAssignee = task.assigneeId;
    const previousDueDate = task.dueDate ? new Date(task.dueDate).toISOString() : null;

    const updateData = { ...data };

    
    if (Object.prototype.hasOwnProperty.call(data, "dueDate")) {
      updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    }

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: updateData,
      include: taskInclude,
    });

    const changes = {};
    if (Object.prototype.hasOwnProperty.call(data, "title") && data.title !== task.title) {
      changes.title = { from: task.title, to: data.title };
    }
    if (
      Object.prototype.hasOwnProperty.call(data, "description") &&
      data.description !== task.description
    ) {
      changes.description = { from: task.description, to: data.description };
    }
    if (
      Object.prototype.hasOwnProperty.call(data, "priority") &&
      data.priority !== task.priority
    ) {
      changes.priority = { from: task.priority, to: data.priority };
    }
    if (Object.prototype.hasOwnProperty.call(data, "dueDate")) {
      const nextDue = data.dueDate ? new Date(data.dueDate).toISOString() : null;
      if (nextDue !== previousDueDate) {
        changes.dueDate = { from: previousDueDate, to: nextDue };
      }
    }
    if (Object.prototype.hasOwnProperty.call(data, "assigneeId")) {
      if (data.assigneeId !== previousAssignee) {
        changes.assigneeId = { from: previousAssignee, to: data.assigneeId };
      }
    }

    if (Object.keys(changes).length) {
      await auditLog(
        userId,
        task.workspaceId,
        "UPDATE_TASK",
        { taskId, changes },
        taskId,
        task.boardId
      );
    }

    if (
      Object.prototype.hasOwnProperty.call(changes, "assigneeId") &&
      changes.assigneeId.from !== changes.assigneeId.to
    ) {
      await auditLog(
        userId,
        task.workspaceId,
        "TASK_ASSIGNEE_UPDATED",
        { taskId, assigneeId: changes.assigneeId.to },
        taskId,
        task.boardId
      );
    }

    if (
      data.assigneeId &&
      data.assigneeId !== previousAssignee &&
      data.assigneeId !== userId
    ) {
      await notificationService.notifyTaskAssigned(updated, data.assigneeId, userId);
    }

    emitToWorkspace(task.workspaceId, "task:updated", {
      task: shapeTask(updated),
      actorId: userId,
    });
    emitToBoard?.(task.boardId, "task:updated", {
      task: shapeTask(updated),
      actorId: userId,
    });

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
      {
        taskId,
        fromColumn: oldColumn,
        toColumn: targetColumnId,
      },
      taskId,
      task.boardId
    );

    const movePayload = {
      taskId,
      fromColumn: oldColumn,
      toColumn: targetColumnId,
      toColumnTitle: targetColumn.title,
      taskTitle: task.title,
      actorId: userId,
    };
    emitToWorkspace(task.workspaceId, "task:moved", movePayload);
    emitToBoard?.(task.boardId, "task:moved", movePayload);

    return {
      success: true,
      message: "Task moved",
      data: updated,
    };
  },


 
  deleteTask: async (taskId, userId) => {
    const task = await requireTaskAccess(taskId, userId);
    await requireWorkspaceOwner(task.workspaceId, userId);

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
      { taskId },
      taskId,
      task.boardId
    );

    emitToWorkspace(task.workspaceId, "task:deleted", {
      taskId,
      columnId: task.columnId,
      boardId: task.boardId,
      actorId: userId,
    });
    emitToBoard?.(task.boardId, "task:deleted", {
      taskId,
      columnId: task.columnId,
      boardId: task.boardId,
      actorId: userId,
    });

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

    const updated = await prisma.task.findUnique({
      where: { id: taskId },
      include: taskInclude,
    });
    if (updated) {
      const shapedTask = shapeTask(updated);
      emitToWorkspace(task.workspaceId, "task:updated", {
        task: shapedTask,
        actorId: userId,
      });
      emitToBoard?.(task.boardId, "task:updated", {
        task: shapedTask,
        actorId: userId,
      });
    }

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

    const updated = await prisma.task.findUnique({
      where: { id: taskId },
      include: taskInclude,
    });
    if (updated) {
      const shapedTask = shapeTask(updated);
      emitToWorkspace(task.workspaceId, "task:updated", {
        task: shapedTask,
        actorId: userId,
      });
      emitToBoard?.(task.boardId, "task:updated", {
        task: shapedTask,
        actorId: userId,
      });
    }

    return {
      success: true,
      message: "Label removed",
    };
  },
};
