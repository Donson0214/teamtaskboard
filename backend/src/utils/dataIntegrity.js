const prisma = require("../libs/prisma");

async function normalizeBoardColumns(boardId) {
  const columns = await prisma.column.findMany({
    where: { boardId },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });

  await Promise.all(
    columns.map((col, idx) =>
      col.order !== idx
        ? prisma.column.update({
            where: { id: col.id },
            data: { order: idx },
          })
        : null
    )
  );

  return columns.length;
}

module.exports = {
  normalizeBoardColumns,
};
