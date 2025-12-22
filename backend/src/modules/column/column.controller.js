const service = require("./column.service");
const errorHandler = require("../../utils/errorHandler");
const { validate } = require("../../utils/validator");

const {
  createColumnSchema,
  updateColumnSchema,
  reorderColumnSchema,
} = require("./column.validation");

module.exports = {
  
  createColumn: async (req, res) => {
    try {
      const body = validate(createColumnSchema, req.body);
      const { boardId, ...data } = body;
      const result = await service.createColumn(
        req.params.workspaceId,
        boardId,
        req.user.id,
        data
      );
      res.json(result);
    } catch (err) {
      errorHandler(res, err);
    }
  },

  
  getColumns: async (req, res) => {
    try {
      const result = await service.getColumns(req.params.workspaceId, req.user.id);
      res.json(result);
    } catch (err) {
      errorHandler(res, err);
    }
  },

  
  updateColumn: async (req, res) => {
    try {
      const body = validate(updateColumnSchema, req.body);
      const result = await service.updateColumn(req.params.columnId, req.user.id, body);
      res.json(result);
    } catch (err) {
      errorHandler(res, err);
    }
  },

  
  reorderColumn: async (req, res) => {
    try {
      const body = validate(reorderColumnSchema, req.body);
      const result = await service.reorderColumn(req.params.columnId, req.user.id, body.order);
      res.json(result);
    } catch (err) {
      errorHandler(res, err);
    }
  },

  
  deleteColumn: async (req, res) => {
    try {
      const result = await service.deleteColumn(req.params.columnId, req.user.id);
      res.json(result);
    } catch (err) {
      errorHandler(res, err);
    }
  },
};
