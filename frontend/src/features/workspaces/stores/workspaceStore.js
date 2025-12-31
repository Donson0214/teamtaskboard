import { defineStore } from "pinia";
import { markRaw } from "vue";
import api, { shouldSuppressApiError } from "@/shared/api/client.js";
import { useAuthStore } from "@/features/auth/stores/authStore";

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

const isValidId = (value) => {
  const str = String(value ?? "").trim();
  return Boolean(str) && str !== "undefined" && str !== "null";
};

const logWorkspaceError = (label, err) => {
  if (shouldSuppressApiError(err)) return;
  console.warn(label, err?.message || err);
};

const dedupeWorkspaces = (list = []) => {
  const seen = new Set();
  return list.filter((ws, idx) => {
    const key = ws?.id ?? ws?._id ?? idx;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

let loadWorkspacesPromise = null;
const memberLoadPromises = new Map();
const pendingWorkspaceMutations = new Set();

const trackWorkspaceMutation = (promise) => {
  pendingWorkspaceMutations.add(promise);
  promise.finally(() => pendingWorkspaceMutations.delete(promise));
  return promise;
};

const ensurePendingInvites = (workspace) => {
  if (!workspace) return null;
  if (!workspace.pendingInvites) {
    workspace.pendingInvites = markRaw(new Set());
  }
  return workspace.pendingInvites;
};

export const useWorkspaceStore = defineStore("workspace", {
  state: () => ({
    workspaces: [],
    selectedWorkspace: null,

    
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


    async loadWorkspaces() {
      if (loadWorkspacesPromise) return loadWorkspacesPromise;
      loadWorkspacesPromise = (async () => {
        try {
          if (pendingWorkspaceMutations.size) {
            await Promise.allSettled([...pendingWorkspaceMutations]);
          }
          const res = await api.get("/workspaces");
          const data = res.data?.data || res.data || [];
          const normalized = data.map(normalizeWorkspace);
          this.workspaces = dedupeWorkspaces(normalized);
          return this.workspaces;
        } catch (err) {
          logWorkspaceError("Load workspaces failed:", err);
          this.workspaces = [];
          return [];
        } finally {
          loadWorkspacesPromise = null;
        }
      })();
      return loadWorkspacesPromise;
    },

    async createWorkspace(name) {
      const trimmed = String(name || "").trim();
      if (!trimmed) return null;

      const auth = useAuthStore();
      const ownerEmail = auth.user?.email || "";
      const ownerName =
        auth.user?.name || auth.user?.displayName || ownerEmail || "User";
      const tempId = `optimistic-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`;

      const optimistic = normalizeWorkspace({
        id: tempId,
        name: trimmed,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        members: ownerEmail
          ? [{ email: ownerEmail, name: ownerName, role: "owner" }]
          : [],
      });
      optimistic.isOptimistic = true;
      this.workspaces.push(optimistic);

      const request = trackWorkspaceMutation(
        api.post("/workspaces", { name: trimmed })
      );

      try {
        const res = await request;
        const ws = normalizeWorkspace(res.data?.data || res.data);
        const idx = this.workspaces.findIndex((w) => w.id === tempId);
        if (idx >= 0) {
          this.workspaces.splice(idx, 1, ws);
        } else {
          const existingIdx = this.workspaces.findIndex((w) => w.id === ws.id);
          if (existingIdx >= 0) {
            this.workspaces.splice(existingIdx, 1, ws);
          } else {
            this.workspaces.push(ws);
          }
        }
        return ws;
      } catch (err) {
        logWorkspaceError("Create workspace failed:", err);
        const idx = this.workspaces.findIndex((w) => w.id === tempId);
        if (idx >= 0) this.workspaces.splice(idx, 1);
        return null;
      }
    },

    async deleteWorkspace(id) {
      if (!isValidId(id)) return false;
      const idx = this.workspaces.findIndex((w) => w.id === id);
      const removedWorkspace = idx >= 0 ? this.workspaces[idx] : null;
      const removedBoards =
        idx >= 0 ? this.boardsByWorkspace[String(id)] : undefined;

      if (idx >= 0) {
        this.workspaces.splice(idx, 1);
        delete this.boardsByWorkspace[String(id)];
      }

      const request = trackWorkspaceMutation(api.delete(`/workspaces/${id}`));
      try {
        await request;
        return true;
      } catch (err) {
        logWorkspaceError("Delete workspace failed:", err);
        if (idx >= 0 && removedWorkspace) {
          this.workspaces.splice(idx, 0, removedWorkspace);
          if (removedBoards !== undefined) {
            this.boardsByWorkspace[String(id)] = removedBoards;
          }
        }
        return false;
      }
    },

    async renameWorkspace(id, name) {
      if (!isValidId(id)) return null;
      const trimmed = String(name || "").trim();
      if (!trimmed) return null;
      const idx = this.workspaces.findIndex((w) => w.id === id);
      const existing = idx >= 0 ? this.workspaces[idx] : null;
      const prevName = existing?.name;

      if (existing) {
        existing.name = trimmed;
      }

      try {
        const res = await api.patch(`/workspaces/${id}`, { name: trimmed });
        const updated = normalizeWorkspace(res.data?.data || res.data);
        const updateIdx = this.workspaces.findIndex((w) => w.id === id);
        if (updateIdx >= 0) this.workspaces.splice(updateIdx, 1, updated);
        return updated;
      } catch (err) {
        logWorkspaceError("Rename workspace failed:", err);
        if (existing && prevName !== undefined) {
          existing.name = prevName;
        }
        return null;
      }
    },



    async loadMembers(workspaceId) {
      if (!isValidId(workspaceId)) return [];
      const key = String(workspaceId);
      if (memberLoadPromises.has(key)) {
        return memberLoadPromises.get(key);
      }

      const request = (async () => {
        try {
          const res = await api.get(`/workspaces/${workspaceId}/members`);
          const ws = this.workspaces.find((w) => w.id === workspaceId);
          if (ws) {
            ws.members = (res.data?.data || res.data || []).map(
              (m) => normalizeWorkspace({ members: [m] }).members[0]
            );
          }
          return ws?.members || [];
        } catch (err) {
          logWorkspaceError("Load members failed:", err);
          const ws = this.workspaces.find((w) => w.id === workspaceId);
          if (ws) ws.members = [];
          return [];
        } finally {
          memberLoadPromises.delete(key);
        }
      })();

      memberLoadPromises.set(key, request);
      return request;
    },

    async inviteMember(workspaceId, email, role = "member") {
      if (!isValidId(workspaceId)) return false;
      const normalizedEmail = email?.trim?.().toLowerCase?.() || "";
      const ws = this.workspaces.find((w) => w.id === workspaceId);
      const pending = ensurePendingInvites(ws);
      if (pending && normalizedEmail) {
        pending.add(normalizedEmail);
      }
      try {
        await api.post(`/workspaces/${workspaceId}/members`, { email, role });
        return true;
      } catch (err) {
        logWorkspaceError("Invite member failed:", err);
        return false;
      } finally {
        if (pending && normalizedEmail) {
          pending.delete(normalizedEmail);
        }
      }
    },

    async setMemberRole(workspaceId, email, role) {
      if (!isValidId(workspaceId)) return null;
      try {
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
        return res.data?.data || res.data;
      } catch (err) {
        logWorkspaceError("Update member role failed:", err);
        return null;
      }
    },

    async removeMember(workspaceId, email) {
      if (!isValidId(workspaceId)) return false;
      const ws = this.workspaces.find((w) => w.id === workspaceId);
      const normalizedEmail = email?.trim?.().toLowerCase?.() || "";
      const prevMembers = ws?.members ? [...ws.members] : null;

      if (ws && normalizedEmail) {
        ws.members = ws.members.filter(
          (m) => m.email?.toLowerCase?.() !== normalizedEmail
        );
      }

      try {
        await api.delete(`/workspaces/${workspaceId}/members`, {
          data: { email },
        });
        return true;
      } catch (err) {
        logWorkspaceError("Remove member failed:", err);
        if (ws && prevMembers) {
          ws.members = prevMembers;
        }
        return false;
      }
    },

    async leaveWorkspace(workspaceId) {
      if (!isValidId(workspaceId)) return false;
      try {
        await api.delete(`/workspaces/${workspaceId}/members/self`);

        this.workspaces = this.workspaces.filter((w) => w.id !== workspaceId);
        delete this.boardsByWorkspace[String(workspaceId)];

        if (this.selectedWorkspace === workspaceId) {
          this.selectedWorkspace = null;
        }
        return true;
      } catch (err) {
        logWorkspaceError("Leave workspace failed:", err);
        return false;
      }
    },

    async loadBoards(workspaceId) {
      if (!isValidId(workspaceId)) {
        this.boardsByWorkspace[String(workspaceId)] = [];
        return [];
      }
      try {
        const res = await api.get(
          `/workspaces/${workspaceId}/board`
        );
        const boards = (res.data?.data || res.data || []).map(normalizeBoard);
        this.boardsByWorkspace[String(workspaceId)] = boards;
        return boards;
      } catch (err) {
        logWorkspaceError("Load boards failed:", err);
        this.boardsByWorkspace[String(workspaceId)] = [];
        return [];
      }
    },

    async createBoard(workspaceId, name, icon, color) {
      if (!isValidId(workspaceId)) return null;
      const payload = {
        name,
        icon: icon || "fas fa-clipboard",
        color:
          color ||
          "linear-gradient(135deg,#667eea,#764ba2)",
      };

      try {
        const res = await api.post(
          `/workspaces/${workspaceId}/board`,
          payload
        );

        const board = normalizeBoard(res.data?.data || res.data);

        const list = this.boardsByWorkspace[String(workspaceId)] || [];
        this.boardsByWorkspace[String(workspaceId)] = [...list, board];

        return board;
      } catch (err) {
        logWorkspaceError("Create board failed:", err);
        return null;
      }
    },

    async updateBoard(workspaceId, boardId, updates) {
      if (!isValidId(workspaceId) || !isValidId(boardId)) return null;
      try {
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
      } catch (err) {
        logWorkspaceError("Update board failed:", err);
        return null;
      }
    },

    async deleteBoard(workspaceId, boardId) {
      if (!isValidId(workspaceId) || !isValidId(boardId)) return false;
      try {
        await api.delete(
          `/workspaces/${workspaceId}/board/${boardId}`
        );

        const list = this.boardsByWorkspace[String(workspaceId)] || [];
        this.boardsByWorkspace[String(workspaceId)] = list.filter(
          (b) => b.id !== boardId
        );
        return true;
      } catch (err) {
        logWorkspaceError("Delete board failed:", err);
        return false;
      }
    },

    async acceptInvitation(workspaceId, role = "member") {
      if (!isValidId(workspaceId)) return null;
      try {
        await api.post(`/workspaces/${workspaceId}/members/accept`, { role });
        await this.loadWorkspaces();
        return this.workspaces.find((w) => w.id === workspaceId) || null;
      } catch (err) {
        logWorkspaceError("Accept invitation failed:", err);
        return null;
      }
    },

    async declineInvitation(workspaceId, role = "member") {
      if (!isValidId(workspaceId)) return false;
      try {
        await api.post(`/workspaces/${workspaceId}/members/decline`, { role });
        return true;
      } catch (err) {
        logWorkspaceError("Decline invitation failed:", err);
        return false;
      }
    },
  },
});

