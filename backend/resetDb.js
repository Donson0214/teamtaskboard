const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function clearAllData() {
  try {
    // Child tables first (respect FK constraints)
    await prisma.deviceToken.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.auditLog.deleteMany();

    await prisma.attachment.deleteMany();
    await prisma.taskComment.deleteMany();
    await prisma.taskLabel.deleteMany();

    // Core entities
    await prisma.task.deleteMany();
    await prisma.column.deleteMany();
    await prisma.board.deleteMany();
    await prisma.label.deleteMany();

    await prisma.workspaceMember.deleteMany();
    // If invitations table exists in your schema, uncomment:
    // await prisma.workspaceInvitation.deleteMany();

    await prisma.workspace.deleteMany();

    // Safety: ensure no stray tokens remain before deleting users
    await prisma.deviceToken.deleteMany();

    // Parents last
    await prisma.user.deleteMany();

    console.log("✔ Database reset complete. All data cleared safely.");
  } catch (error) {
    console.error("❌ Error clearing data:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

clearAllData();

