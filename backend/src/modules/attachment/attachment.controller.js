const service = require("./attachment.service");
const errorHandler = require("../../utils/errorHandler");
const { validate } = require("../../utils/validator");
const { taskIdSchema, attachmentIdSchema } = require("./attachment.validation");

module.exports = {
 
  uploadAttachment: async (req, res) => {
    try {
      const { taskId } = validate(taskIdSchema, {
        taskId: req.params.taskId,
      });
      if (!req.file) throw new Error("No file uploaded");

      const result = await service.uploadAttachment(
        taskId,
        req.user.id,
        req.file
      );

      res.json(result);
    } catch (err) {
      errorHandler(res, err);
    }
  },

 
  getAttachments: async (req, res) => {
    try {
      const { taskId } = validate(taskIdSchema, {
        taskId: req.params.taskId,
      });
      const result = await service.getAttachments(
        taskId,
        req.user.id
      );

      res.json(result);
    } catch (err) {
      errorHandler(res, err);
    }
  },

 
  deleteAttachment: async (req, res) => {
    try {
      const { attachmentId } = validate(attachmentIdSchema, {
        attachmentId: req.params.attachmentId,
      });
      const result = await service.deleteAttachment(
        attachmentId,
        req.user.id
      );

      res.json(result);
    } catch (err) {
      errorHandler(res, err);
    }
  },
};
