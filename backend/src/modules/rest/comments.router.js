const router = require("express").Router();
const { z } = require("zod");

const commentService = require("../comment/comment.service");
const errorHandler = require("../../utils/errorHandler");
const { validate, validateQuery } = require("../../utils/validator");
const { createCommentSchema, deleteCommentSchema } = require("../comment/comment.validation");

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format");
const taskQuerySchema = z.object({ taskId: objectId });

router.get("/", async (req, res) => {
  try {
    const { taskId } = validateQuery(taskQuerySchema, req.query);
    const result = await commentService.getComments(taskId, req.user.id);
    res.json(result);
  } catch (err) {
    errorHandler(res, err);
  }
});

router.post("/", async (req, res) => {
  try {
    const { taskId, content } = validate(
      createCommentSchema.extend({ taskId: objectId }),
      req.body
    );
    const result = await commentService.createComment(taskId, req.user.id, content);
    res.json(result);
  } catch (err) {
    errorHandler(res, err);
  }
});

router.delete("/:commentId", async (req, res) => {
  try {
    const { commentId } = validate(deleteCommentSchema, req.params);
    const result = await commentService.deleteComment(commentId, req.user.id);
    res.json(result);
  } catch (err) {
    errorHandler(res, err);
  }
});

module.exports = router;
