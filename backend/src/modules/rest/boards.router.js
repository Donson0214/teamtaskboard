const router = require("express").Router();
const { z } = require("zod");

const boardService = require("../board/board.service");
const errorHandler = require("../../utils/errorHandler");
const { validate, validateQuery } = require("../../utils/validator");
const { createBoardSchema, updateBoardSchema } = require("../board/board.validation");

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format");
const workspaceQuerySchema = z.object({ workspaceId: objectId });
const boardIdSchema = z.object({ boardId: objectId });
const createBoardBodySchema = createBoardSchema.extend({ workspaceId: objectId });

router.get("/", async (req, res) => {
  try {
    const { workspaceId } = validateQuery(workspaceQuerySchema, req.query);
    const result = await boardService.getBoards(workspaceId, req.user.id);
    res.json(result);
  } catch (err) {
    errorHandler(res, err);
  }
});

router.post("/", async (req, res) => {
  try {
    const body = validate(createBoardBodySchema, req.body);
    const { workspaceId, ...data } = body;
    const result = await boardService.createBoard(workspaceId, req.user.id, data);
    res.json(result);
  } catch (err) {
    errorHandler(res, err);
  }
});

router.get("/:boardId", async (req, res) => {
  try {
    const { boardId } = validate(boardIdSchema, req.params);
    const result = await boardService.getBoardById(boardId, req.user.id);
    res.json(result);
  } catch (err) {
    errorHandler(res, err);
  }
});

router.patch("/:boardId", async (req, res) => {
  try {
    const { boardId } = validate(boardIdSchema, req.params);
    const body = validate(updateBoardSchema, req.body);
    const result = await boardService.updateBoard(boardId, body, req.user.id);
    res.json(result);
  } catch (err) {
    errorHandler(res, err);
  }
});

router.delete("/:boardId", async (req, res) => {
  try {
    const { boardId } = validate(boardIdSchema, req.params);
    const result = await boardService.deleteBoard(boardId, req.user.id);
    res.json(result);
  } catch (err) {
    errorHandler(res, err);
  }
});

module.exports = router;
