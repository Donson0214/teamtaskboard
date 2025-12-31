const taskService = require("./task.service");
const prisma = require("../../libs/prisma");
const { auditLog } = require("../../utils/audit");
const permissions = require("../../utils/permissions");
const notificationService = require("../notification/notification.service");
const socket = require("../../realtime/socket");

jest.mock("../../libs/prisma", () => ({
  column: { findUnique: jest.fn() },
  task: { create: jest.fn(), update: jest.fn() },
}));

jest.mock("../../utils/audit", () => ({ auditLog: jest.fn() }));

jest.mock("../../utils/permissions", () => ({
  requireWorkspaceEditor: jest.fn(),
  requireTaskAccess: jest.fn(),
}));

jest.mock("../../realtime/socket", () => ({
  emitToWorkspace: jest.fn(),
  emitToBoard: jest.fn(),
}));

jest.mock("../notification/notification.service", () => ({
  notifyTaskAssigned: jest.fn(),
}));

describe("task.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("createTask creates a task and logs audit", async () => {
    const workspaceId = "ws-1";
    const columnId = "col-1";
    const userId = "user-1";
    const boardId = "board-1";

    permissions.requireWorkspaceEditor.mockResolvedValueOnce({ role: "MEMBER" });
    prisma.column.findUnique.mockResolvedValueOnce({
      id: columnId,
      workspaceId,
      boardId,
    });
    prisma.task.create.mockResolvedValueOnce({
      id: "task-1",
      title: "Test task",
      workspaceId,
      boardId,
      columnId,
      taskLabels: [],
    });

    const result = await taskService.createTask(workspaceId, columnId, userId, {
      title: "Test task",
    });

    expect(prisma.task.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          title: "Test task",
          workspaceId,
          boardId,
          columnId,
        }),
      })
    );
    expect(auditLog).toHaveBeenCalledWith(
      userId,
      workspaceId,
      "CREATE_TASK",
      expect.any(Object),
      "task-1",
      boardId
    );
    expect(socket.emitToWorkspace).toHaveBeenCalledWith(
      workspaceId,
      "task:created",
      expect.any(Object)
    );
    expect(result.success).toBe(true);
  });

  test("createTask enforces workspace editor permission", async () => {
    permissions.requireWorkspaceEditor.mockRejectedValueOnce(
      new Error("Forbidden")
    );

    await expect(
      taskService.createTask("ws-1", "col-1", "user-1", { title: "Test" })
    ).rejects.toThrow("Forbidden");

    expect(prisma.task.create).not.toHaveBeenCalled();
  });

  test("updateTask enforces workspace editor permission", async () => {
    const task = {
      id: "task-1",
      title: "Old title",
      dueDate: new Date("2025-01-01T00:00:00.000Z"),
      assigneeId: "user-1",
      workspaceId: "ws-1",
      boardId: "board-1",
    };

    permissions.requireTaskAccess.mockResolvedValueOnce(task);
    permissions.requireWorkspaceEditor.mockRejectedValueOnce(
      new Error("Forbidden")
    );

    await expect(
      taskService.updateTask(task.id, "user-2", { title: "New title" })
    ).rejects.toThrow("Forbidden");

    expect(prisma.task.update).not.toHaveBeenCalled();
  });

  test("updateTask logs changes and notifies assignee", async () => {
    const task = {
      id: "task-1",
      title: "Old title",
      description: "Old description",
      priority: "LOW",
      dueDate: new Date("2025-01-01T00:00:00.000Z"),
      assigneeId: "user-1",
      workspaceId: "ws-1",
      boardId: "board-1",
    };

    permissions.requireTaskAccess.mockResolvedValueOnce(task);
    permissions.requireWorkspaceEditor.mockResolvedValueOnce({ role: "MEMBER" });

    const updated = {
      ...task,
      title: "New title",
      assigneeId: "user-2",
      dueDate: new Date("2025-02-01T00:00:00.000Z"),
      taskLabels: [],
    };

    prisma.task.update.mockResolvedValueOnce(updated);

    await taskService.updateTask(task.id, "user-3", {
      title: "New title",
      assigneeId: "user-2",
      dueDate: "2025-02-01",
    });

    const updateArgs = prisma.task.update.mock.calls[0][0];
    expect(updateArgs.data.dueDate).toBeInstanceOf(Date);
    expect(auditLog).toHaveBeenCalledWith(
      "user-3",
      task.workspaceId,
      "UPDATE_TASK",
      expect.objectContaining({ taskId: task.id, changes: expect.any(Object) }),
      task.id,
      task.boardId
    );
    expect(auditLog).toHaveBeenCalledWith(
      "user-3",
      task.workspaceId,
      "TASK_ASSIGNEE_UPDATED",
      expect.objectContaining({ taskId: task.id, assigneeId: "user-2" }),
      task.id,
      task.boardId
    );
    expect(notificationService.notifyTaskAssigned).toHaveBeenCalledWith(
      updated,
      "user-2",
      "user-3"
    );
  });
});
