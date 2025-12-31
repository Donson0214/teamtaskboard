const prisma = require("../libs/prisma");
const { isUnknownArgumentError } = require("./prismaErrors");


async function auditLog(
  userId,
  workspaceId,
  action,
  details = null,
  taskId = null,
  boardId = null
) {
  if (!userId) {
    console.warn("auditLog skipped: userId is missing");
    return;
  }

  try {
    const payload =
      typeof details === "string" ? details : JSON.stringify(details);

    try {
      await prisma.auditLog.create({
        data: {
          userId,
          workspaceId,
          taskId,
          boardId,
          action,
          details: details ? payload : null,
        },
      });
    } catch (err) {
      if (isUnknownArgumentError(err, "boardId")) {
        await prisma.auditLog.create({
          data: {
            userId,
            workspaceId,
            taskId,
            action,
            details: details ? payload : null,
          },
        });
        return;
      }
      throw err;
    }
  } catch (err) {
    console.error("AuditLog error:", err?.message);
  }
}

module.exports = { auditLog };
