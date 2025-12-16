const prisma = require("../../libs/prisma");

const { auditLog } = require("../../utils/audit");
const {
  requireWorkspaceMember,
  requireWorkspaceOwner,
  requireWorkspaceEditor,
} = require("../../utils/permissions");
const { emitToTask } = require("../../realtime/socket");
const notificationService = require("../notification/notification.service");

/* -------------------- helpers -------------------- */

function extractMentions(content = "") {
  const regex = /@([\w.+-]+@[\w.-]+|[\w.-]+)/g;
  const matches = [...content.matchAll(regex)];
  return matches.map((m) => m[1].toLowerCase());
}

/* -------------------- service -------------------- */

module.exports = {
  createComment: async (taskId, userId, content) => {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        workspace: true,
      },
    });
    if (!task) throw new Error("Task not found");

    await requireWorkspaceEditor(task.workspaceId, userId);

    const comment = await prisma.taskComment.create({
      data: { taskId, userId, content },
      include: { user: true },
    });

    // realtime update
    emitToTask(taskId, "comment:added", comment);

    /* -------------------- MENTIONS -------------------- */

    const mentions = extractMentions(content);

    if (mentions.length > 0) {
      const mentionedUsers = await prisma.user.findMany({
        where: {
          OR: [
            { email: { in: mentions } },
            { name: { in: mentions } },
          ],
        },
      });

      // remove self-mentions
      const recipients = mentionedUsers.filter(
        (u) => u.id !== userId
      );

      if (recipients.length > 0) {
        // ✅ use EXISTING backend method
        await notificationService.notifyMentions(taskId, recipients);
      }
    }

    /* -------------------- AUDIT -------------------- */

    await auditLog(userId, task.workspaceId, "COMMENT_CREATE", {
      taskId,
      content,
    });

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
        task: { include: { workspace: true } },
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

    await auditLog(userId, workspaceId, "COMMENT_DELETE", { commentId });

    return {
      success: true,
      message: "Comment deleted",
    };
  },
};
