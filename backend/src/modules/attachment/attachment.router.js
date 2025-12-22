const router = require("express").Router({ mergeParams: true });
const { requireAuth } = require("../../middleware/auth");
const upload = require("../../middleware/upload"); 
const controller = require("./attachment.controller");
const { requireTaskAccess } = require("../../utils/permissions");
const prisma = require("../../libs/prisma");



router.use(requireAuth);


router.post(
  "/tasks/:taskId/attachments",
  async (req, res, next) => {
    try {
      await requireTaskAccess(req.params.taskId, req.user.id); 
      next();
    } catch (err) {
      res.status(err.status || 403).json({ message: err.message });
    }
  },
  upload.single("file"),            
  controller.uploadAttachment       
);


router.get(
  "/tasks/:taskId/attachments",
  async (req, res, next) => {
    try {
      await requireTaskAccess(req.params.taskId, req.user.id);
      next();
    } catch (err) {
      res.status(err.status || 403).json({ message: err.message });
    }
  },
  controller.getAttachments
);


router.delete(
  "/attachments/:attachmentId",
  async (req, res, next) => {
    try {
     
      const attachment = await prisma.attachment.findUnique({
        where: { id: req.params.attachmentId },
        include: { task: true },
      });

      if (!attachment || !attachment.taskId) {
        return res.status(404).json({ message: "Attachment not found" });
      }

      await requireTaskAccess(attachment.taskId, req.user.id);
      next();
    } catch (err) {
      res.status(err.status || 403).json({ message: err.message });
    }
  },
  controller.deleteAttachment
);

module.exports = router;
