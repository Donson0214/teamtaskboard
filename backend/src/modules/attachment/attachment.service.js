const prisma = require("../../libs/prisma");
const cloudinary = require("../../libs/cloudinary");
const { requireTaskAccess, requireWorkspaceEditor } = require("../../utils/permissions");
const { auditLog } = require("../../utils/audit");
const { v4: uuidv4 } = require("uuid");
const streamifier = require("streamifier");

module.exports = {

  uploadAttachment: async (taskId, userId, file) => {
    
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        column: true,
        workspace: true,
      },
    });

    if (!task) throw new Error("Task not found");

    
    await requireTaskAccess(taskId, userId);
    await requireWorkspaceEditor(task.workspaceId, userId);

   
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "teamtaskboard/attachments",
          public_id: uuidv4(),
          resource_type: "auto", 
        },
        (err, result) => {
          if (err) {
            console.error("Cloudinary Upload Error:", err);
            reject(err);
          } else {
            resolve(result);
          }
        }
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });

    
    const attachment = await prisma.attachment.create({
      data: {
        taskId,
        fileUrl: uploadResult.secure_url,
        fileName: file.originalname,
        fileType: file.mimetype,
        fileSize: file.size,
        storagePath: uploadResult.public_id, 
      },
    });

    
    await auditLog(
      userId,
      task.workspaceId,
      "UPLOAD_ATTACHMENT",
      JSON.stringify({
        taskId,
        attachmentId: attachment.id,
      })
    );

    return {
      success: true,
      message: "Attachment uploaded successfully",
      data: attachment,
    };
  },

  
  getAttachments: async (taskId, userId) => {
    await requireTaskAccess(taskId, userId);

    const attachments = await prisma.attachment.findMany({
      where: { taskId },
      orderBy: { createdAt: "asc" },
    });

    return {
      success: true,
      data: attachments,
    };
  },

 
  deleteAttachment: async (attachmentId, userId) => {
    const attachment = await prisma.attachment.findUnique({
      where: { id: attachmentId },
      include: {
        task: {
          include: {
            column: true,
            workspace: true,
          },
        },
      },
    });

    if (!attachment) throw new Error("Attachment not found");

    await requireTaskAccess(attachment.taskId, userId);
    await requireWorkspaceEditor(attachment.task.workspaceId, userId);

    
    try {
      await cloudinary.uploader.destroy(attachment.storagePath);
    } catch (err) {
      console.warn("Cloudinary delete failed (ignored):", err);
    }

    
    await prisma.attachment.delete({
      where: { id: attachmentId },
    });

    return {
      success: true,
      message: "Attachment deleted",
    };
  },
};
