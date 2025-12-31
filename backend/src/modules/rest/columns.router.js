const router = require("express").Router();
const { z } = require("zod");

const columnService = require("../column/column.service");
const errorHandler = require("../../utils/errorHandler");
const { validate, validateQuery } = require("../../utils/validator");
const {
  createColumnSchema,
  updateColumnSchema,
  reorderColumnSchema,
} = require("../column/column.validation");

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format");
const columnIdSchema = z.object({ columnId: objectId });
const listColumnsSchema = z.object({
  workspaceId: objectId,
  boardId: objectId,
});
const createColumnBodySchema = createColumnSchema.extend({
  workspaceId: objectId,
});

router.get("/", async (req, res) => {
  try {
    const { workspaceId, boardId } = validateQuery(listColumnsSchema, req.query);
    const result = await columnService.getColumns(workspaceId, boardId, req.user.id);
    res.json(result);
  } catch (err) {
    errorHandler(res, err);
  }
});

router.post("/", async (req, res) => {
  try {
    const body = validate(createColumnBodySchema, req.body);
    const { workspaceId, boardId, title, color } = body;
    const result = await columnService.createColumn(
      workspaceId,
      boardId,
      req.user.id,
      { title, color }
    );
    res.json(result);
  } catch (err) {
    errorHandler(res, err);
  }
});

router.patch("/:columnId", async (req, res) => {
  try {
    const { columnId } = validate(columnIdSchema, req.params);
    const body = validate(updateColumnSchema, req.body);
    const result = await columnService.updateColumn(columnId, req.user.id, body);
    res.json(result);
  } catch (err) {
    errorHandler(res, err);
  }
});

router.put("/:columnId/reorder", async (req, res) => {
  try {
    const { columnId } = validate(columnIdSchema, req.params);
    const body = validate(reorderColumnSchema, req.body);
    const result = await columnService.reorderColumn(
      columnId,
      req.user.id,
      body.order
    );
    res.json(result);
  } catch (err) {
    errorHandler(res, err);
  }
});

router.delete("/:columnId", async (req, res) => {
  try {
    const { columnId } = validate(columnIdSchema, req.params);
    const result = await columnService.deleteColumn(columnId, req.user.id);
    res.json(result);
  } catch (err) {
    errorHandler(res, err);
  }
});

module.exports = router;
