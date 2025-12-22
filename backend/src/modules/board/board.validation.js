const { z } = require("zod");

exports.createBoardSchema = z.object({
  name: z.string().min(1, "Board name is required"),
  icon: z.string().optional(),
  color: z.string().optional(),
});

exports.updateBoardSchema = z.object({
  name: z.string().min(1, "Board name is required").optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
});
