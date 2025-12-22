const { z } = require("zod");

const optionalString = z.preprocess((val) => {
  if (val === undefined || val === null) return undefined;
  if (typeof val === "string") {
    const trimmed = val.trim();
    return trimmed === "" ? undefined : trimmed;
  }
  return val;
}, z.string().optional());

module.exports.auditQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  action: optionalString,
  taskId: optionalString,
  userId: optionalString,
});
