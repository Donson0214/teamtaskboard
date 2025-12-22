const { z } = require("zod");

module.exports.uploadAttachmentSchema = z.object({
  taskId: z.string().min(1, "taskId is required"),
});

module.exports.deleteAttachmentSchema = z.object({
  attachmentId: z.string().min(1, "attachmentId is required"),
});
