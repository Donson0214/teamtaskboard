const prisma = require("../../libs/prisma");

const { auditLog } = require("../../utils/audit");
const {
  requireWorkspaceMember,
  requireWorkspaceOwner,
  requireWorkspaceEditor,
} = require("../../utils/permissions");
const { emitToTask, emitToBoard, emitToWorkspace } = require("../../realtime/socket");
const notificationService = require("../notification/notification.service");

function extractMentions(content = "") {
  const regex = /@([\w.+-]+@[\w.-]+|[\w.-]+)/g;
  const matches = [...content.matchAll(regex)];
  return matches.map((m) => m[1].toLowerCase());
}

module.exports = {
  createComment: async (taskId, userId, content) => {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        workspace: true,
        board: true,
      },
    });
    if (!task) throw new Error("Task not found");

    await requireWorkspaceEditor(task.workspaceId, userId);

    const comment = await prisma.taskComment.create({
      data: { taskId, userId, content },
      include: { user: true },
    });

    const payload = {
      task: {
        id: task.id,
        title: task.title,
        workspaceId: task.workspaceId,
        boardId: task.boardId,
      },
      comment,
    };
    emitToTask(taskId, "comment:added", comment);
    emitToWorkspace?.(task.workspaceId, "task:commented", payload);
    emitToBoard?.(task.boardId, "task:commented", payload);

    const mentions = extractMentions(content);
    const hasMentions = mentions.length > 0;

    if (mentions.length > 0) {
      const mentionedUsers = await prisma.user.findMany({
        where: {
          OR: [
            { email: { in: mentions } },
            { name: { in: mentions } },
          ],
        },
      });

      const recipients = mentionedUsers.filter(
        (u) => u.id !== userId
      );

      if (recipients.length > 0) {
   
        await notificationService.notifyMentions(taskId, recipients);
      }
    }

    await auditLog(userId, task.workspaceId, "COMMENT_CREATE", {
      taskId,
      content,
    }, taskId, task.boardId);

    if (hasMentions) {
      emitToWorkspace?.(task.workspaceId, "task:mentioned", payload);
      emitToBoard?.(task.boardId, "task:mentioned", payload);
    }

    return {
      success: true,
      message: "Comment added",
      data: comment,
    };
  },

  getComments: async (taskId, userId) => {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { workspace: true },
    });
    if (!task) throw new Error("Task not found");

    await requireWorkspaceMember(task.workspaceId, userId);

    const comments = await prisma.taskComment.findMany({
      where: { taskId },
      include: { user: true },
      orderBy: { createdAt: "asc" },
    });

    return {
      success: true,
      message: "Comments loaded",
      data: comments,
    };
  },

  deleteComment: async (commentId, userId) => {
    const comment = await prisma.taskComment.findUnique({
      where: { id: commentId },
      include: {
        user: true,
        task: { include: { workspace: true, board: true } },
      },
    });

    if (!comment) throw new Error("Comment not found");

    const workspaceId = comment.task.workspaceId;

    await requireWorkspaceEditor(workspaceId, userId);
    if (comment.userId !== userId) {
      await requireWorkspaceOwner(workspaceId, userId);
    }

    await prisma.taskComment.delete({ where: { id: commentId } });

    emitToTask(comment.taskId, "comment:deleted", { commentId });

    await auditLog(userId, workspaceId, "COMMENT_DELETE", { commentId }, comment.taskId, comment.task?.boardId);

    return {
      success: true,
      message: "Comment deleted",
    };
  },
};
