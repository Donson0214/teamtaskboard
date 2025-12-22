const { z } = require("zod");

const colorSchema = z
  .string()
  .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Color must be a hex value like #ff0000");

module.exports.createLabelSchema = z.object({
  name: z.string().min(1, "Label name is required"),
  color: colorSchema.optional().default("#6366f1"),
});

module.exports.updateLabelSchema = z.object({
  name: z.string().min(1, "Label name is required").optional(),
  color: colorSchema.optional(),
});
