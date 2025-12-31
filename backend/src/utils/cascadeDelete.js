const { isUnknownArgumentError } = require("./prismaErrors");

async function cascadeDeleteBoard(client, boardId) {

  const tasks = await client.task.findMany({
    where: { boardId },
    select: { id: true },
  });

  const taskIds = tasks.map((t) => t.id);

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

  try {
    await client.auditLog.deleteMany({
      where: { boardId },
    });
  } catch (err) {
    if (!isUnknownArgumentError(err, "boardId")) {
      throw err;
    }
  }

  
  await client.task.deleteMany({
    where: { boardId },
  });

  
  await client.column.deleteMany({
    where: { boardId },
  });


  await client.board.delete({
    where: { id: boardId },
  });
}


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
