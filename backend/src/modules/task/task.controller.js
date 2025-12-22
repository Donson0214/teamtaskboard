const service = require("./task.service");
const errorHandler = require("../../utils/errorHandler");
const { validate } = require("../../utils/validator");
const {
  createTaskSchema,
  updateTaskSchema,
  moveTaskSchema,
} = require("./task.validation");
const { createLabelSchema } = require("../label/label.validation");

module.exports = {
  
  createTask: async (req, res) => {
    try {
      const { workspaceId, columnId } = req.params;
      const userId = req.user.id;

      const body = validate(createTaskSchema, req.body);

      const result = await service.createTask(
        workspaceId,
        columnId,
        userId,
        body
      );

      res.json(result);
    } catch (err) {
      errorHandler(res, err);
    }
  },

  
  getColumnTasks: async (req, res) => {
    try {
      const { workspaceId, columnId } = req.params;
      const userId = req.user.id;

      const result = await service.getColumnTasks(workspaceId, columnId, userId);
      res.json(result);
    } catch (err) {
      errorHandler(res, err);
    }
  },

 
  updateTask: async (req, res) => {
    try {
      const { taskId } = req.params;
      const userId = req.user.id;
      const body = validate(updateTaskSchema, req.body);

      const result = await service.updateTask(taskId, userId, body);
      res.json(result);
    } catch (err) {
      errorHandler(res, err);
    }
  },

  
  moveTask: async (req, res) => {
    try {
      const { taskId } = req.params;
      const userId = req.user.id;
      const body = validate(moveTaskSchema, req.body);

      const result = await service.moveTask(
        taskId,
        userId,
        body.targetColumnId
      );

      res.json(result);
    } catch (err) {
      errorHandler(res, err);
    }
  },

  
  deleteTask: async (req, res) => {
    try {
      const { taskId } = req.params;
      const userId = req.user.id;

      const result = await service.deleteTask(taskId, userId);
      res.json(result);
    } catch (err) {
      errorHandler(res, err);
    }
  },

  
  addLabel: async (req, res) => {
    try {
      const { taskId } = req.params;
      const userId = req.user.id;

      const body = validate(createLabelSchema, req.body);
      const result = await service.addLabel(taskId, userId, body);

      res.json(result);
    } catch (err) {
      errorHandler(res, err);
    }
  },

  
  removeLabel: async (req, res) => {
    try {
      const { taskId, labelId } = req.params;
      const userId = req.user.id;

      const result = await service.removeLabel(taskId, userId, labelId);
      res.json(result);
    } catch (err) {
      errorHandler(res, err);
    }
  },
};
