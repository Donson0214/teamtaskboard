const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function clearAllData() {
  try {
    await prisma.$transaction([
      // 🔥 CHILD TABLES FIRST
      prisma.deviceToken.deleteMany(),     // ✅ FIX (THIS WAS MISSING)
      prisma.notification.deleteMany(),
      prisma.auditLog.deleteMany(),
      prisma.attachment.deleteMany(),
      prisma.taskComment.deleteMany(),
      prisma.taskLabel.deleteMany(),

      // 🔁 CORE ENTITIES
      prisma.task.deleteMany(),
      prisma.label.deleteMany(),
      prisma.column.deleteMany(),
      prisma.workspaceMember.deleteMany(),
      prisma.workspace.deleteMany(),

      // 🧍‍♂️ PARENT LAST
      prisma.user.deleteMany(),
    ]);

    console.log("✅ All data has been cleared. Database is now empty.");
  } catch (error) {
    console.error("❌ Error clearing data:", error);
  } finally {
    await prisma.$disconnect();
  }
}

clearAllData();
