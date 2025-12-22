// backend/src/app.js
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const express = require("express");
const cors = require("cors");

const app = express();

const { requireAuth } = require("./middleware/auth");

// Routers
const authRouter = require("./modules/auth/auth.router");
const workspaceRouter = require("./modules/workspace/workspace.router");
const columnRouter = require("./modules/column/column.router");
const taskRouter = require("./modules/task/task.router");
const commentRouter = require("./modules/comment/comment.router");
const attachmentRouter = require("./modules/attachment/attachment.router");
const notificationRouter = require("./modules/notification/notification.router");
const deviceTokenRouter = require("./modules/deviceToken/deviceToken.router");
const auditRouter = require("./modules/audit/audit.router");
const labelRouter = require("./modules/label/label.router");
const boardRouter = require("./modules/board/board.router");

app.use(cors());
app.use(express.json());


app.use("/api/auth", authRouter);


app.use("/api/workspaces", requireAuth, workspaceRouter);
app.use("/api/workspaces/:workspaceId", requireAuth, columnRouter);
app.use("/api/workspaces/:workspaceId", requireAuth, taskRouter);
// Board routes (mounted twice to support both '/board' and '/boards' frontend usages)
app.use("/api/workspaces/:workspaceId/board", requireAuth, boardRouter);
app.use("/api/workspaces/:workspaceId/boards", requireAuth, boardRouter);
app.use("/api/workspaces/:workspaceId", requireAuth, commentRouter);
app.use("/api/workspaces/:workspaceId", requireAuth, attachmentRouter);

app.use("/api/device-tokens", requireAuth, deviceTokenRouter);
app.use("/api", requireAuth, notificationRouter);
app.use("/api/workspaces/:workspaceId", requireAuth, labelRouter);
app.use("/api/audit", requireAuth, auditRouter);

// HOME ROUTE
app.get("/", (req, res) => {
  res.send("TeamTaskBoard API is running...");
});

module.exports = app;
