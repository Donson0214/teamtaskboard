const { Server } = require("socket.io");
const { randomUUID } = require("crypto");

let io;

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: "*", 
    },
  });

  io.on("connection", (socket) => {
    console.log("Socket connected", socket.id);

    
    socket.on("joinWorkspace", (workspaceId) => {
      socket.join(`workspace:${workspaceId}`);
      console.log(`Joined workspace room: ${workspaceId}`);
    });

    socket.on("leaveWorkspace", (workspaceId) => {
      socket.leave(`workspace:${workspaceId}`);
      console.log(`Left workspace room: ${workspaceId}`);
    });

    
    
    socket.on("joinUser", (userHandle) => {
      if (!userHandle) return;
      socket.join(`user:${userHandle}`);
      console.log(`Joined user room: ${userHandle}`);
    });

   
    socket.on("joinTask", (taskId) => {
      socket.join(`task:${taskId}`);
      console.log(`Joined task room: ${taskId}`);
    });

   
    socket.on("leaveTask", (taskId) => {
      socket.leave(`task:${taskId}`);
      console.log(`Left task room: ${taskId}`);
    });

    // Board rooms (frontend uses joinBoard / leaveBoard)
    socket.on("joinBoard", (boardId) => {
      socket.join(`board:${boardId}`);
      console.log(`Joined board room: ${boardId}`);
    });

    socket.on("leaveBoard", (boardId) => {
      socket.leave(`board:${boardId}`);
      console.log(`Left board room: ${boardId}`);
    });

    
    socket.on("disconnect", () => {
      console.log("Socket disconnected", socket.id);
    });
  });

  return io;
}

function getIo() {
  if (!io) throw new Error("Socket.io not initialized!");
  return io;
}


function emitToWorkspace(workspaceId, event, data) {
  if (!io) return;
  io.to(`workspace:${workspaceId}`).emit(event, data);
}

function emitToUser(userHandle, event, data) {
  if (!io || !userHandle) return;
  io.to(`user:${userHandle}`).emit(event, data);
}

function emitToTask(taskId, event, data) {
  if (!io || !taskId) return;
  io.to(`task:${taskId}`).emit(event, data);
}

function emitToBoard(boardId, event, data) {
  if (!io || !boardId) return;
  io.to(`board:${boardId}`).emit(event, data);
}

module.exports = {
  initSocket,
  getIo,
  emitToWorkspace,
  emitToUser,
  emitToTask,
  emitToBoard,
};
