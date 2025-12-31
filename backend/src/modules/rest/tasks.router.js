const router = require("express").Router();
const { z } = require("zod");

const taskService = require("../task/task.service");
const errorHandler = require("../../utils/errorHandler");
const { validate, validateQuery } = require("../../utils/validator");
const {
  createTaskSchema,
  updateTaskSchema,
  moveTaskSchema,
} = require("../task/task.validation");

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format");
const taskIdSchema = z.object({ taskId: objectId });
const columnTaskQuerySchema = z.object({
  workspaceId: objectId,
  columnId: objectId,
});
const createTaskBodySchema = createTaskSchema.extend({
  workspaceId: objectId,
  columnId: objectId,
});

router.get("/", async (req, res) => {
  try {
    const { workspaceId, columnId } = validateQuery(columnTaskQuerySchema, req.query);
    const result = await taskService.getColumnTasks(
      workspaceId,
      columnId,
      req.user.id
    );
    res.json(result);
  } catch (err) {
    errorHandler(res, err);
  }
});

router.post("/", async (req, res) => {
  try {
    const body = validate(createTaskBodySchema, req.body);
    const { workspaceId, columnId, ...data } = body;
    const result = await taskService.createTask(
      workspaceId,
      columnId,
      req.user.id,
      data
    );
    res.json(result);
  } catch (err) {
    errorHandler(res, err);
  }
});

router.get("/:taskId", async (req, res) => {
  try {
    const { taskId } = validate(taskIdSchema, req.params);
    const result = await taskService.getTaskById(taskId, req.user.id);
    res.json(result);
  } catch (err) {
    errorHandler(res, err);
  }
});

router.patch("/:taskId", async (req, res) => {
  try {
    const { taskId } = validate(taskIdSchema, req.params);
    const body = validate(updateTaskSchema, req.body);
    const result = await taskService.updateTask(taskId, req.user.id, body);
    res.json(result);
  } catch (err) {
    errorHandler(res, err);
  }
});

router.put("/:taskId/move", async (req, res) => {
  try {
    const { taskId } = validate(taskIdSchema, req.params);
    const body = validate(moveTaskSchema, req.body);
    const result = await taskService.moveTask(
      taskId,
      req.user.id,
      body.targetColumnId
    );
    res.json(result);
  } catch (err) {
    errorHandler(res, err);
  }
});

router.delete("/:taskId", async (req, res) => {
  try {
    const { taskId } = validate(taskIdSchema, req.params);
    const result = await taskService.deleteTask(taskId, req.user.id);
    res.json(result);
  } catch (err) {
    errorHandler(res, err);
  }
});

module.exports = router;
