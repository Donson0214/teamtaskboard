const { PrismaClient } = require("@prisma/client");
const { admin } = require("../src/libs/firebase");
const { cascadeDeleteWorkspace } = require("../src/utils/cascadeDelete");

const prisma = new PrismaClient();

const DEMO = {
  email: "demo@taskflow.dev",
  password: "Demouser123",
  name: "Demo user",
  workspaceName: "Demo Workspace",
  boardName: "Demo Board",
};

const DEFAULT_COLUMNS = [
  { title: "To Do", color: "#8b5cf6" },
  { title: "In Progress", color: "#f97316" },
  { title: "Done", color: "#22c55e" },
];

const PRIORITY_LABELS = [
  { name: "Urgent", color: "#ef4444" },
  { name: "High", color: "#f97316" },
  { name: "Medium", color: "#3b82f6" },
  { name: "Low", color: "#6366f1" },
];

const addDays = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

const ensureFirebaseUser = async () => {
  try {
    const existing = await admin.auth().getUserByEmail(DEMO.email);
    await admin.auth().updateUser(existing.uid, {
      displayName: DEMO.name,
      password: DEMO.password,
      emailVerified: true,
    });
    return existing;
  } catch (err) {
    if (err?.code === "auth/user-not-found") {
      return admin.auth().createUser({
        email: DEMO.email,
        password: DEMO.password,
        displayName: DEMO.name,
        emailVerified: true,
      });
    }
    throw err;
  }
};

const ensureDbUser = async () => {
  return prisma.user.upsert({
    where: { email: DEMO.email },
    update: { name: DEMO.name },
    create: { email: DEMO.email, name: DEMO.name },
  });
};

const clearExistingDemo = async (ownerId) => {
  const existing = await prisma.workspace.findMany({
    where: { ownerId, name: DEMO.workspaceName },
    select: { id: true },
  });

  for (const ws of existing) {
    await cascadeDeleteWorkspace(prisma, ws.id);
  }
};

const seedDemo = async () => {
  await ensureFirebaseUser();
  const user = await ensureDbUser();

  await clearExistingDemo(user.id);

  const workspace = await prisma.workspace.create({
    data: {
      name: DEMO.workspaceName,
      ownerId: user.id,
      members: {
        create: {
          userId: user.id,
          role: "OWNER",
        },
      },
    },
  });

  await prisma.label.createMany({
    data: PRIORITY_LABELS.map((label) => ({
      ...label,
      workspaceId: workspace.id,
    })),
  });

  const board = await prisma.board.create({
    data: {
      name: DEMO.boardName,
      workspaceId: workspace.id,
      color: "linear-gradient(135deg,#6366f1,#14b8a6)",
      icon: "fas fa-layer-group",
    },
  });

  const columnsByTitle = {};
  for (const [idx, col] of DEFAULT_COLUMNS.entries()) {
    const created = await prisma.column.create({
      data: {
        title: col.title,
        color: col.color,
        order: idx,
        workspaceId: workspace.id,
        boardId: board.id,
      },
    });
    columnsByTitle[col.title] = created;
  }

  const tasks = [
    {
      title: "Project kickoff",
      description: "Align scope, success metrics, and timeline.",
      priority: "HIGH",
      column: "To Do",
      dueInDays: 3,
    },
    {
      title: "Design wireframes",
      description: "Create initial layouts for key screens.",
      priority: "MEDIUM",
      column: "To Do",
      dueInDays: 5,
    },
    {
      title: "Implement auth flow",
      description: "Build login/register UI and connect auth.",
      priority: "URGENT",
      column: "In Progress",
      dueInDays: 2,
    },
    {
      title: "Set up database",
      description: "Configure Prisma schema and seed data.",
      priority: "HIGH",
      column: "In Progress",
      dueInDays: 4,
    },
    {
      title: "Ship staging build",
      description: "Deploy the staging environment for review.",
      priority: "MEDIUM",
      column: "Done",
      dueInDays: -1,
    },
    {
      title: "Write release notes",
      description: "Summarize changes for the demo release.",
      priority: "LOW",
      column: "Done",
      dueInDays: 1,
    },
  ];

  for (const task of tasks) {
    const column = columnsByTitle[task.column];
    if (!column) continue;
    await prisma.task.create({
      data: {
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.column,
        dueDate: typeof task.dueInDays === "number" ? addDays(task.dueInDays) : null,
        workspaceId: workspace.id,
        boardId: board.id,
        columnId: column.id,
        assigneeId: user.id,
      },
    });
  }

  console.log("Demo seed created:");
  console.log(`- Email: ${DEMO.email}`);
  console.log(`- Password: ${DEMO.password}`);
  console.log(`- Workspace: ${DEMO.workspaceName}`);
  console.log(`- Board: ${DEMO.boardName}`);
};

seedDemo()
  .catch((err) => {
    console.error("Demo seed failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
