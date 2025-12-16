const service = require("./notification.service");
const errorHandler = require("../../utils/errorHandler");
const { validate } = require("../../utils/validator");
const { markReadSchema } = require("./notification.validation");

module.exports = {
  // List notifications for the authenticated user
  getMyNotifications: async (req, res) => {
    try {
      const result = await service.getMyNotifications(req.user.id);
      res.json(result);
    } catch (err) {
      errorHandler(res, err);
    }
  },


  
  markRead: async (req, res) => {
    try {
      const body = validate(markReadSchema, req.body);
      const result = await service.markRead(req.params.notificationId, req.user.id, body.read);
      res.json(result);
    } catch (err) {
      errorHandler(res, err);
    }
  },

  
  markAllRead: async (req, res) => {
    try {
      const result = await service.markAllRead(req.user.id);
      res.json(result);
    } catch (err) {
      errorHandler(res, err);
    }
  },
};
