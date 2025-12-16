const { z } = require("zod");


const createWorkspaceSchema = z.object({
  name: z.string().min(1, "Workspace name is required"),
});


const updateWorkspaceSchema = z.object({
  name: z.string().min(1).optional(),
});


const addMemberSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["OWNER", "ADMIN", "MEMBER"]).default("MEMBER"),
});


const updateMemberRoleSchema = z.object({
  role: z.enum(["OWNER", "ADMIN", "MEMBER"]),
});

module.exports = {
  createWorkspaceSchema,
  updateWorkspaceSchema,
  addMemberSchema,
  updateMemberRoleSchema,
};
