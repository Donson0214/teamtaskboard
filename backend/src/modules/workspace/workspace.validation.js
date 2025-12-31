const { z } = require("zod");


const createWorkspaceSchema = z.object({
  name: z.string().min(1, "Workspace name is required"),
});


const updateWorkspaceSchema = z.object({
  name: z.string().min(1).optional(),
});


const addMemberSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["OWNER", "MEMBER", "GUEST"]).default("MEMBER"),
});


const updateMemberRoleSchema = z.object({
  role: z.enum(["OWNER", "MEMBER", "GUEST"]),
});

const roleSchema = z.preprocess(
  (val) => (typeof val === "string" ? val.toUpperCase() : val),
  z.enum(["MEMBER", "GUEST"])
);

const inviteMemberSchema = z.object({
  email: z.string().email("Valid email is required"),
  role: roleSchema.default("MEMBER"),
  name: z.string().optional().nullable(),
});

const updateMemberByEmailSchema = z.object({
  email: z.string().email("Valid email is required"),
  role: roleSchema,
});

const removeMemberSchema = z.object({
  email: z.string().email("Valid email is required"),
});

const respondInviteSchema = z.object({
  role: roleSchema.optional().default("MEMBER"),
});

module.exports = {
  createWorkspaceSchema,
  updateWorkspaceSchema,
  addMemberSchema,
  updateMemberRoleSchema,
  inviteMemberSchema,
  updateMemberByEmailSchema,
  removeMemberSchema,
  respondInviteSchema,
};
