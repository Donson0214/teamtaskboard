let ioRef = null;


function setSocketIO(ioInstance) {
  ioRef = ioInstance;
}


function broadcastToWorkspace(workspaceId, event, data) {
  if (!ioRef || !workspaceId) return;
  ioRef.to(`workspace:${workspaceId}`).emit(event, data);
}

module.exports = {
  setSocketIO,
  broadcastToWorkspace,
};
