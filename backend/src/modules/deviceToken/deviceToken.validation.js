const { z } = require("zod");

exports.registerDeviceTokenSchema = z.object({
  token: z.string().min(1, "Token is required"),
  platform: z.string().optional(),
});
