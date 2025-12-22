const service = require("./label.service");
const errorHandler = require("../../utils/errorHandler");
const { validate } = require("../../utils/validator");
const { createLabelSchema, updateLabelSchema } = require("./label.validation");

module.exports = {
  list: async (req, res) => {
    try {
      const { workspaceId } = req.params;
      const result = await service.listByWorkspace(workspaceId, req.user.id);
      res.json(result);
    } catch (err) {
      errorHandler(res, err);
    }
  },

  create: async (req, res) => {
    try {
      const { workspaceId } = req.params;
      const body = validate(createLabelSchema, req.body);
      const result = await service.createLabel(workspaceId, req.user.id, body);
      res.json(result);
    } catch (err) {
      errorHandler(res, err);
    }
  },

  update: async (req, res) => {
    try {
      const body = validate(updateLabelSchema, req.body);
      const result = await service.updateLabel(req.params.labelId, req.user.id, body);
      res.json(result);
    } catch (err) {
      errorHandler(res, err);
    }
  },

  remove: async (req, res) => {
    try {
      const result = await service.deleteLabel(req.params.labelId, req.user.id);
      res.json(result);
    } catch (err) {
      errorHandler(res, err);
    }
  },

  assignToTask: async (req, res) => {
    try {
      const { taskId, labelId } = req.params;
      const result = await service.assignLabel(taskId, labelId, req.user.id);
      res.json(result);
    } catch (err) {
      errorHandler(res, err);
    }
  },

  removeFromTask: async (req, res) => {
    try {
      const { taskId, labelId } = req.params;
      const result = await service.removeLabel(taskId, labelId, req.user.id);
      res.json(result);
    } catch (err) {
      errorHandler(res, err);
    }
  },
};
