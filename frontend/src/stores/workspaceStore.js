import { defineStore } from "pinia";
import api from "@/api.js";

function normalizeWorkspace(ws) {
  const members = (ws.members || []).map((m) => ({
    id: m.id,
    userId: m.userId || m.user?.id,
    email: m.user?.email || m.email,
    name: m.user?.name || m.name || null,
    role: (m.role || "member").toLowerCase(),
  }));

  return { ...ws, members };
}

function normalizeBoard(board) {
  return {
    ...board,
    icon: board.icon || "fas fa-clipboard",
    color:
      board.color ||
      "linear-gradient(135deg,#667eea,#764ba2)",
    tasksCount: board.tasksCount || 0,
  };
}

export const useWorkspaceStore = defineStore("workspace", {
  state: () => ({
    workspaces: [],
    selectedWorkspace: null,

    // boards cached per workspace
    boardsByWorkspace: {},
  }),

  getters: {
    getUserRole: (state) => (workspaceId, userEmail) => {
      const ws = state.workspaces.find((w) => w.id === workspaceId);
      if (!ws) return "member";
      const members = ws.members || [];
      const normalizedEmail = userEmail?.toLowerCase?.() || "";
      const member = members.find(
        (m) => m.email?.toLowerCase?.() === normalizedEmail
      );
      return member?.role || "member";
    },

    getWorkspaceById: (state) => (id) => {
      return state.workspaces.find((w) => w.id === id);
    },

    getBoards: (state) => (workspaceId) => {
      return state.boardsByWorkspace[String(workspaceId)] || [];
    },

    getMembers: (state) => (workspaceId) => {
      const ws = state.workspaces.find((w) => w.id === workspaceId);
      return ws?.members || [];
    },
  },

  actions: {
    setCurrentWorkspace(id) {
      this.selectedWorkspace = id;
    },

    /* ============================
       WORKSPACES
    ============================ */

    async loadWorkspaces() {
      const res = await api.get("/workspaces");
      const data = res.data?.data || res.data || [];
      this.workspaces = data.map(normalizeWorkspace);
      return this.workspaces;
    },

    async createWorkspace(name) {
      const res = await api.post("/workspaces", { name });
      const ws = normalizeWorkspace(res.data?.data || res.data);
      this.workspaces.push(ws);
      return ws;
    },

    async deleteWorkspace(id) {
      await api.delete(`/workspaces/${id}`);
      this.workspaces = this.workspaces.filter((w) => w.id !== id);
      delete this.boardsByWorkspace[String(id)];
    },

    async renameWorkspace(id, name) {
      const res = await api.patch(`/workspaces/${id}`, { name });
      const updated = normalizeWorkspace(res.data?.data || res.data);
      const idx = this.workspaces.findIndex((w) => w.id === id);
      if (idx >= 0) this.workspaces.splice(idx, 1, updated);
      return updated;
    },

    /* ============================
       MEMBERS
    ============================ */

    async loadMembers(workspaceId) {
      const res = await api.get(`/workspaces/${workspaceId}/members`);
      const ws = this.workspaces.find((w) => w.id === workspaceId);
      if (ws) {
        ws.members = (res.data?.data || res.data || []).map(
          (m) => normalizeWorkspace({ members: [m] }).members[0]
        );
      }
      return ws?.members || [];
    },

    async inviteMember(workspaceId, email, role = "member") {
      const res = await api.post(`/workspaces/${workspaceId}/members`, {
        email,
        role,
      });

      const ws = this.workspaces.find((w) => w.id === workspaceId);
      if (ws) {
        const member = normalizeWorkspace({
          members: [res.data?.data || res.data],
        }).members[0];

        const idx = ws.members.findIndex((m) => m.email === member.email);
        if (idx >= 0) ws.members.splice(idx, 1, member);
        else ws.members.push(member);
      }
    },

    async setMemberRole(workspaceId, email, role) {
      const res = await api.patch(`/workspaces/${workspaceId}/members`, {
        email,
        role,
      });

      const ws = this.workspaces.find((w) => w.id === workspaceId);
      if (ws) {
        const member = normalizeWorkspace({
          members: [res.data?.data || res.data],
        }).members[0];

        const idx = ws.members.findIndex((m) => m.email === member.email);
        if (idx >= 0) ws.members.splice(idx, 1, member);
      }
    },

    async removeMember(workspaceId, email) {
      await api.delete(`/workspaces/${workspaceId}/members`, {
        data: { email },
      });

      const ws = this.workspaces.find((w) => w.id === workspaceId);
      if (ws) ws.members = ws.members.filter((m) => m.email !== email);
    },

    async leaveWorkspace(workspaceId) {
      await api.delete(`/workspaces/${workspaceId}/members/self`);

      this.workspaces = this.workspaces.filter((w) => w.id !== workspaceId);
      delete this.boardsByWorkspace[String(workspaceId)];

      if (this.selectedWorkspace === workspaceId) {
        this.selectedWorkspace = null;
      }
    },

    /* ============================
       ✅ BOARDS (CORRECT PATHS)
    ============================ */

    async loadBoards(workspaceId) {
      const res = await api.get(
        `/workspaces/${workspaceId}/board`
      );
      const boards = (res.data?.data || res.data || []).map(normalizeBoard);
      this.boardsByWorkspace[String(workspaceId)] = boards;
      return boards;
    },

    async createBoard(workspaceId, name, icon, color) {
      const payload = {
        name,
        icon: icon || "fas fa-clipboard",
        color:
          color ||
          "linear-gradient(135deg,#667eea,#764ba2)",
      };

      const res = await api.post(
        `/workspaces/${workspaceId}/board`,
        payload
      );

      const board = normalizeBoard(res.data?.data || res.data);

      const list = this.boardsByWorkspace[String(workspaceId)] || [];
      this.boardsByWorkspace[String(workspaceId)] = [...list, board];

      return board;
    },

    async updateBoard(workspaceId, boardId, updates) {
      const res = await api.patch(
        `/workspaces/${workspaceId}/board/${boardId}`,
        updates
      );

      const updated = normalizeBoard(res.data?.data || res.data);

      const list = this.boardsByWorkspace[String(workspaceId)] || [];
      this.boardsByWorkspace[String(workspaceId)] = list.map((b) =>
        b.id === boardId ? updated : b
      );

      return updated;
    },

    async deleteBoard(workspaceId, boardId) {
      await api.delete(
        `/workspaces/${workspaceId}/board/${boardId}`
      );

      const list = this.boardsByWorkspace[String(workspaceId)] || [];
      this.boardsByWorkspace[String(workspaceId)] = list.filter(
        (b) => b.id !== boardId
      );
    },
  },
});
