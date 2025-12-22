const prisma = require("../libs/prisma");


async function auditLog(userId, workspaceId, action, details = null, taskId = null) {
  if (!userId) {
    console.warn("auditLog skipped: userId is missing");
    return;
  }

  try {
    await prisma.auditLog.create({
      data: {
        userId,
        workspaceId,
        taskId,
        action,
        details: details ? JSON.stringify(details) : null,
      },
    });
  } catch (err) {
    console.error("AuditLog error:", err?.message);
  }
}

module.exports = { auditLog };
