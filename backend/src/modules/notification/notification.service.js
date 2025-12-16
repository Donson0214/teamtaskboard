const prisma = require("../../libs/prisma");
const axios = require("axios");

/**
 * =========================
 * PUSH (STUB)
 * =========================
 */
async function sendPushToUser() {
  return;
}

/**
 * =========================
 * EMAIL (BREVO)
 * =========================
 */
async function sendBrevoEmail(user, message, taskId) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail =
    process.env.BREVO_SENDER_EMAIL || process.env.BREVO_SENDER;

  if (!apiKey || !senderEmail || !user?.email) return;

  try {
    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          email: senderEmail,
          name: process.env.BREVO_SENDER_NAME || "TeamTaskBoard",
        },
        to: [{ email: user.email, name: user.name || user.email }],
        subject: "TeamTaskBoard notification",
        textContent: `${message}${taskId ? `\nTask ID: ${taskId}` : ""}`,
      },
      {
        headers: {
          "api-key": apiKey,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err) {
    console.warn("Brevo email failed:", err.message);
  }
}

module.exports = {
  /**
   * =========================
   * CREATE + EMIT NOTIFICATION
   * =========================
   */
  notifyUser: async (
    userId,
    message,
    taskId = null,
    workspaceId = null,
    options = {}
  ) => {
    const {
      skipWorkspaceBroadcast = true,
      actorId = null, // do not notify the actor about their own action
    } = options;

    if (!userId || (actorId && actorId === userId)) {
      return null;
    }

    // Load user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    // Create notification (NO boardId — not in schema)
    const notification = await prisma.notification.create({
      data: {
        userId,
        message,
        taskId,
        workspaceId,
      },
    });

    /**
     * 🔴 CRITICAL FIX
     * Lazy-load socket to avoid circular dependency
     */
    let emitToWorkspace, emitToUser;
    try {
      ({ emitToWorkspace, emitToUser } = require("../../realtime/socket"));
    } catch (_) {
      // Socket not initialized yet (startup / tests)
    }

    // Emit to user
    emitToUser?.(user?.email || userId, "notification:new", {
      id: notification.id,
      message: notification.message,
      read: notification.read,
      createdAt: notification.createdAt,
    });

    // Emit to workspace (unless skipped)
    if (workspaceId && !skipWorkspaceBroadcast) {
      emitToWorkspace?.(workspaceId, "notification:new", {
        id: notification.id,
        message: notification.message,
        read: notification.read,
        createdAt: notification.createdAt,
      });
    }

    // Optional channels
    await sendPushToUser(userId, {
      title: "TeamTaskBoard",
      body: message,
      data: taskId ? { taskId } : {},
    });

    await sendBrevoEmail(user, message, taskId);

    return notification;
  },

  /**
   * =========================
   * TASK ASSIGNED
   * =========================
   */
  notifyTaskAssigned: async (task, assignedUserId, actorId = null) => {
    await module.exports.notifyUser(
      assignedUserId,
      `You were assigned to the task "${task.title}".`,
      task.id,
      task.workspaceId,
      { skipWorkspaceBroadcast: true, actorId }
    );
  },

  /**
   * =========================
   * MENTIONS
   * =========================
   */
  notifyMentions: async (taskId, users) => {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });
    if (!task) return;

    for (const user of users) {
      await module.exports.notifyUser(
        user.id,
        `You were mentioned in a comment on task "${task.title}".`,
        taskId,
        task.workspaceId,
        { skipWorkspaceBroadcast: true }
      );
    }
  },

  /**
   * =========================
   * GET MY NOTIFICATIONS
   * =========================
   */
  getMyNotifications: async (userId) => {
    const list = await prisma.notification.findMany({
      where: { userId },
      include: {
        task: {
          include: { workspace: true, board: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      message: "Notifications loaded",
      data: list,
    };
  },

  /**
   * =========================
   * MARK ONE READ
   * =========================
   */
  markRead: async (notificationId, userId, read) => {
    const notif = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notif || notif.userId !== userId) {
      const err = new Error("Notification not found");
      err.status = 404;
      throw err;
    }

    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: { read },
    });

    return {
      success: true,
      message: "Notification updated",
      data: updated,
    };
  },

  /**
   * =========================
   * MARK ALL READ
   * =========================
   */
  markAllRead: async (userId) => {
    await prisma.notification.updateMany({
      where: { userId },
      data: { read: true },
    });

    return {
      success: true,
      message: "All notifications marked as read",
    };
  },
};
