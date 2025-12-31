const router = require("express").Router();
const { z } = require("zod");

const upload = require("../../middleware/upload");
const attachmentService = require("../attachment/attachment.service");
const errorHandler = require("../../utils/errorHandler");
const { validate, validateQuery } = require("../../utils/validator");

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format");
const taskQuerySchema = z.object({ taskId: objectId });
const attachmentIdSchema = z.object({ attachmentId: objectId });
const uploadBodySchema = z.object({ taskId: objectId });

router.get("/", async (req, res) => {
  try {
    const { taskId } = validateQuery(taskQuerySchema, req.query);
    const result = await attachmentService.getAttachments(taskId, req.user.id);
    res.json(result);
  } catch (err) {
    errorHandler(res, err);
  }
});

router.post("/", upload.single("file"), async (req, res) => {
  try {
    const { taskId } = validate(uploadBodySchema, req.body);
    if (!req.file) throw new Error("No file uploaded");
    const result = await attachmentService.uploadAttachment(
      taskId,
      req.user.id,
      req.file
    );
    res.json(result);
  } catch (err) {
    errorHandler(res, err);
  }
});

router.delete("/:attachmentId", async (req, res) => {
  try {
    const { attachmentId } = validate(attachmentIdSchema, req.params);
    const result = await attachmentService.deleteAttachment(attachmentId, req.user.id);
    res.json(result);
  } catch (err) {
    errorHandler(res, err);
  }
});

module.exports = router;
