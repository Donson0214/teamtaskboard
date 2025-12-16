// ===============================
// CASCADE DELETE (MONGODB SAFE)
// ===============================

async function cascadeDeleteBoard(client, boardId) {
  // 1. Find tasks in board
  const tasks = await client.task.findMany({
    where: { boardId },
    select: { id: true },
  });

  const taskIds = tasks.map((t) => t.id);

  // 2. Delete task-related data
  if (taskIds.length) {
    await client.taskLabel.deleteMany({
      where: { taskId: { in: taskIds } },
    });

    await client.attachment.deleteMany({
      where: { taskId: { in: taskIds } },
    });

    await client.taskComment.deleteMany({
      where: { taskId: { in: taskIds } },
    });

    await client.notification.deleteMany({
      where: { taskId: { in: taskIds } },
    });

    await client.auditLog.deleteMany({
      where: { taskId: { in: taskIds } },
    });
  }

  // 3. Delete tasks
  await client.task.deleteMany({
    where: { boardId },
  });

  // 4. Delete columns
  await client.column.deleteMany({
    where: { boardId },
  });

  // 5. Delete board
  await client.board.delete({
    where: { id: boardId },
  });
}

// ===============================
// WORKSPACE DELETE (UNCHANGED)
// ===============================

async function cascadeDeleteWorkspace(client, workspaceId) {
  const tasks = await client.task.findMany({
    where: { workspaceId },
    select: { id: true },
  });

  const taskIds = tasks.map((t) => t.id);

  if (taskIds.length) {
    await client.taskLabel.deleteMany({ where: { taskId: { in: taskIds } } });
    await client.attachment.deleteMany({ where: { taskId: { in: taskIds } } });
    await client.taskComment.deleteMany({ where: { taskId: { in: taskIds } } });
    await client.notification.deleteMany({ where: { taskId: { in: taskIds } } });
    await client.auditLog.deleteMany({ where: { taskId: { in: taskIds } } });
  }

  await client.task.deleteMany({ where: { workspaceId } });
  await client.label.deleteMany({ where: { workspaceId } });
  await client.column.deleteMany({ where: { workspaceId } });
  await client.notification.deleteMany({ where: { workspaceId } });
  await client.auditLog.deleteMany({ where: { workspaceId } });
  await client.workspaceMember.deleteMany({ where: { workspaceId } });

  await client.workspace.delete({ where: { id: workspaceId } });
}

module.exports = {
  cascadeDeleteBoard,
  cascadeDeleteWorkspace,
};
