const { z } = require("zod");

exports.sessionSchema = z.object({
  idToken: z.string().min(1, "Missing idToken"),
});
