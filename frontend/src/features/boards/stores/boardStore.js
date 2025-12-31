
import { defineStore } from "pinia";
import api, { shouldSuppressApiError } from "@/shared/api/client.js";

const normalizeAttachment = (attachment) => ({
  ...attachment,
  url: attachment.fileUrl || attachment.url,
  name: attachment.fileName || attachment.name,
  type: attachment.fileType || attachment.type || "",
});

const normalizeComment = (comment) => ({
  id: comment.id,
  text: comment.content || comment.text,
  author: comment.user?.email || comment.user?.name || "User",
  createdAt: comment.createdAt,
});

function extractLabelsFromColumns(columns = []) {
  const map = new Map();
  columns.forEach((col) => {
    (col.tasks || []).forEach((t) => {
      (t.labelDetails || []).forEach((label) => {
        const key = label.id || label.name;
        if (!map.has(key)) {
          map.set(key, {
            id: label.id,
            name: label.name || label,
            color: label.color || "#6366f1",
          });
        }
      });
    });
  });
  return Array.from(map.values());
}

function normalizeTask(task) {
  const labelDetails = (task.labels || []).map((l) => ({
    id: l.id,
    name: l.name || l,
    color: l.color || "#6366f1",
  }));

  const priority = task.priority ? task.priority.toLowerCase() : "medium";

  let dueDate = "";
  if (task.dueDate) {
    const parsed = new Date(task.dueDate);
    if (!Number.isNaN(parsed.getTime())) {
      dueDate = parsed.toISOString().slice(0, 10);
    }
  }

  return {
    ...task,
    labels: labelDetails.map((l) => l.name),
    labelDetails,
    assigneeId: task.assigneeId || task.assignee?.id || null,
    assignee: task.assignee?.email || task.assignee?.name || null,
    priority,
    dueDate,
    comments: (task.comments || []).map(normalizeComment),
    attachments: (task.attachments || []).map(normalizeAttachment),
  };
}

function findTaskInColumns(columns = [], taskId) {
  for (const col of columns) {
    const task = (col.tasks || []).find((t) => t.id === taskId);
    if (task) return { task, column: col };
  }
  return { task: null, column: null };
}

const isValidId = (value) => {
  const str = String(value ?? "").trim();
  return Boolean(str) && str !== "undefined" && str !== "null";
};

const logBoardError = (label, err) => {
  if (shouldSuppressApiError(err)) return;
  console.warn(label, err?.message || err);
};

const parseAuditDetails = (raw) => {
  if (!raw) return null;
  let value = raw;
  if (typeof value === "string") {
    try {
      value = JSON.parse(value);
    } catch {
      return { raw };
    }
  }
  if (typeof value === "string") {
    try {
      value = JSON.parse(value);
    } catch {
      return { raw: value };
    }
  }
  return value;
};

export const useBoardStore = defineStore("board", {
  state: () => ({
    
    boards: [],

    workspaceId: null,
    boardId: null,

    currentBoard: null,
    columns: [],
    labels: [],
    boardActivity: [],
  }),

  getters: {
    totalTasks: (state) =>
      state.columns.reduce((sum, col) => sum + (col.tasks?.length || 0), 0),
  },

  actions: {
    

    async loadBoards(workspaceId) {
      this.workspaceId = workspaceId;
      if (!isValidId(workspaceId)) {
        this.boards = [];
        return [];
      }
      try {
        const res = await api.get(`/workspaces/${workspaceId}/board`);
        this.boards = res.data?.data || res.data || [];
        return this.boards;
      } catch (err) {
        logBoardError("Load boards failed:", err);
        this.boards = [];
        return [];
      }
    },

    async createBoard(workspaceId, name, icon, color) {
      if (!isValidId(workspaceId)) return null;
      try {
        const res = await api.post(`/workspaces/${workspaceId}/board`, {
          name,
          icon,
          color,
        });
        const board = res.data?.data || res.data;
        this.boards.push(board);
        return board;
      } catch (err) {
        logBoardError("Create board failed:", err);
        return null;
      }
    },

    async updateBoard(workspaceId, boardId, payload) {
      if (!isValidId(workspaceId) || !isValidId(boardId)) return null;
      try {
        const res = await api.patch(
          `/workspaces/${workspaceId}/board/${boardId}`,
          payload
        );
        const updated = res.data?.data || res.data;
        const idx = this.boards.findIndex((b) => b.id === boardId);
        if (idx !== -1) this.boards.splice(idx, 1, updated);
        return updated;
      } catch (err) {
        logBoardError("Update board failed:", err);
        return null;
      }
    },

    async deleteBoard(workspaceId, boardId) {
      if (!isValidId(workspaceId) || !isValidId(boardId)) return false;
      try {
        await api.delete(`/workspaces/${workspaceId}/board/${boardId}`);
        this.boards = this.boards.filter((b) => b.id !== boardId);
        return true;
      } catch (err) {
        logBoardError("Delete board failed:", err);
        return false;
      }
    },

    async loadBoard(workspaceId, boardId) {
      if (!isValidId(workspaceId) || !isValidId(boardId)) {
        logBoardError("Skipped loadBoard due to missing identifiers:", {
          workspaceId,
          boardId,
        });
        return null;
      }
      this.workspaceId = workspaceId;
      this.boardId = boardId;

      try {
        const res = await api.get(`/workspaces/${workspaceId}/board/${boardId}`);
        const board = res.data?.data || res.data;
        this.currentBoard = board;

        this.columns = (board.columns || []).map((c) => ({
          ...c,
          color: c.color || "#6366f1",
          tasks: (() => {
            const seen = new Set();
            const deduped = [];
            (c.tasks || []).forEach((t) => {
              const normalized = normalizeTask(t);
              const key = normalized.id || normalized._id;
              if (key && seen.has(key)) return;
              if (key) seen.add(key);
              deduped.push(normalized);
            });
            return deduped;
          })(),
        }));

        try {
          await this.loadLabels();
        } catch (err) {
          logBoardError("Load labels failed:", err);
          this.labels = extractLabelsFromColumns(this.columns);
        }

        try {
          await this.loadBoardActivity(workspaceId);
        } catch (err) {
          logBoardError("Load board activity failed:", err);
        }

        return board;
      } catch (err) {
        logBoardError("Load board failed:", err);
        this.currentBoard = null;
        this.columns = [];
        this.labels = [];
        this.boardActivity = [];
        return null;
      }
    },


    async addTask(columnId, payload) {
      if (!this.workspaceId) {
        logBoardError("Add task failed:", "Missing workspaceId");
        return null;
      }

      const { title, description, dueDate, priority, assigneeId } = payload || {};

      const body = {
        title,
        description,
        dueDate,
        priority: priority ? String(priority).toUpperCase() : undefined,
        assigneeId,
      };

      try {
        const res = await api.post(
          `/workspaces/${this.workspaceId}/columns/${columnId}/tasks`,
          body
        );

        const task = normalizeTask(res.data?.data || res.data);
        const column = this.columns.find((c) => c.id === columnId);
        if (column) {
          column.tasks = [...(column.tasks || []), task];
        }

        const createdAt = task.createdAt || new Date().toISOString();
        const entry = {
          id: `local-${task.id || task._id}-create-${createdAt}`,
          action: "CREATE_TASK",
          message: "CREATE_TASK",
          details: { taskId: task.id || task._id, title: task.title },
          taskId: task.id || task._id || null,
          createdAt,
        };
        this.boardActivity = [entry, ...(this.boardActivity || [])].slice(0, 100);

        if (Array.isArray(payload?.labels)) {
          for (const name of payload.labels) {
            try {
              await this.addTaskLabel(task.id, name);
            } catch (err) {
              logBoardError("Add task label failed:", err);
            }
          }
        }

        
        if (payload?.comment?.trim()) {
          try {
            await this.addComment(task.id, { content: payload.comment.trim() });
          } catch (err) {
            logBoardError("Add task comment failed:", err);
          }
        }

        
        if (Array.isArray(payload?.attachments) && payload.attachments.length) {
          for (const file of payload.attachments) {
            if (!file) continue;
            try {
              await this.uploadAttachment(task.id, file);
            } catch (err) {
              logBoardError("Upload attachment failed:", err);
            }
          }
        }

        return task;
      } catch (err) {
        logBoardError("Add task failed:", err);
        return null;
      }
    },

    async updateTask(taskId, updates) {
      if (!this.workspaceId) {
        logBoardError("Update task failed:", "Missing workspaceId");
        return null;
      }

      const payload = {
        ...updates,
      };

      if (payload.priority) {
        payload.priority = String(payload.priority).toUpperCase();
      }

      try {
        const res = await api.patch(
          `/workspaces/${this.workspaceId}/tasks/${taskId}`,
          payload
        );

        const updated = normalizeTask(res.data?.data || res.data);
        const { column } = findTaskInColumns(this.columns, taskId);
        if (column) {
          column.tasks = (column.tasks || []).map((t) =>
            t.id === taskId ? { ...t, ...updated } : t
          );
        }

        return updated;
      } catch (err) {
        logBoardError("Update task failed:", err);
        return null;
      }
    },

    async moveTask(taskId, targetColumnId) {
      if (!this.workspaceId) {
        logBoardError("Move task failed:", "Missing workspaceId");
        return false;
      }

      try {
        const res = await api.put(
          `/workspaces/${this.workspaceId}/tasks/${taskId}/move`,
          {
            targetColumnId,
          }
        );

        const updatedRaw = res.data?.data || res.data || null;
        const updatedAt = updatedRaw?.updatedAt || new Date().toISOString();

        const { task, column } = findTaskInColumns(this.columns, taskId);
        if (column) {
          column.tasks = (column.tasks || []).filter((t) => t.id !== taskId);
        }

        const target = this.columns.find((c) => c.id === targetColumnId);
        if (target && task) {
          const merged = {
            ...task,
            columnId: targetColumnId,
            updatedAt,
          };
          target.tasks = [
            ...(target.tasks || []).filter((t) => t.id !== taskId),
            merged,
          ];

          const entry = {
            id: `local-${taskId}-move-${updatedAt}`,
            action: "MOVE_TASK",
            message: "MOVE_TASK",
            details: { taskId, toColumnId: targetColumnId },
            taskId,
            createdAt: updatedAt,
          };
          this.boardActivity = [entry, ...(this.boardActivity || [])].slice(0, 100);
        } else if (!target) {
          await this.loadBoard(this.workspaceId, this.boardId);
        }
        return true;
      } catch (err) {
        logBoardError("Move task failed:", err);
        return false;
      }
    },

    async deleteTask(taskId, columnId = null) {
      if (!this.workspaceId) {
        logBoardError("Delete task failed:", "Missing workspaceId");
        return false;
      }

      try {
        await api.delete(`/workspaces/${this.workspaceId}/tasks/${taskId}`);

        const { column } = columnId
          ? { column: this.columns.find((c) => c.id === columnId) }
          : findTaskInColumns(this.columns, taskId);

        if (column) {
          column.tasks = (column.tasks || []).filter((t) => t.id !== taskId);
        }
        return true;
      } catch (err) {
        logBoardError("Delete task failed:", err);
        return false;
      }
    },


    async addComment(taskId, payload = {}) {
      if (!this.workspaceId) {
        logBoardError("Add comment failed:", "Missing workspaceId");
        return null;
      }

      try {
        const content = payload.content ?? payload.text ?? "";
        const res = await api.post(
          `/workspaces/${this.workspaceId}/tasks/${taskId}/comments`,
          { content }
        );

        const rawComment = res.data?.data || res.data;
        const comment = { ...normalizeComment(rawComment), user: rawComment.user };

        const { column } = findTaskInColumns(this.columns, taskId);
        const task = column?.tasks?.find((t) => t.id === taskId);
        if (task) {
          task.comments = [...(task.comments || []), comment];
        }

        return comment;
      } catch (err) {
        logBoardError("Add comment failed:", err);
        return null;
      }
    },


    async loadLabels() {
      if (!this.workspaceId) return [];
      try {
        const res = await api.get(`/workspaces/${this.workspaceId}/labels`);
        const labels = res.data?.data || res.data || [];
        this.labels = labels.map((label) => ({
          ...label,
          color: label.color || "#6366f1",
        }));
        return this.labels;
      } catch (err) {
        logBoardError("Load labels failed:", err);
        this.labels = extractLabelsFromColumns(this.columns);
        return this.labels;
      }
    },

    async createLabel(name, color) {
      if (!this.workspaceId) return null;
      try {
        const res = await api.post(`/workspaces/${this.workspaceId}/labels`, {
          name,
          color,
        });
        const label = res.data?.data || res.data;
        this.labels.push(label);
        return label;
      } catch (err) {
        logBoardError("Create label failed:", err);
        return null;
      }
    },

    async updateLabelName(oldName, newName) {
      const label = this.labels.find((l) => l.name === oldName);
      if (!label) return null;

      try {
        const res = await api.patch(
          `/workspaces/${this.workspaceId}/labels/${label.id}`,
          { name: newName }
        );

        const updated = res.data?.data || res.data;
        label.name = updated.name;

        this.columns.forEach((col) => {
          col.tasks.forEach((task) => {
            if (task.labelDetails) {
              task.labelDetails = task.labelDetails.map((l) =>
                l.id === label.id ? { ...l, name: updated.name } : l
              );
              task.labels = task.labelDetails.map((l) => l.name);
            }
          });
        });

        return updated;
      } catch (err) {
        logBoardError("Update label name failed:", err);
        return null;
      }
    },

    async updateLabelColor(name, color) {
      const label = this.labels.find((l) => l.name === name);
      if (!label) return null;

      try {
        const res = await api.patch(
          `/workspaces/${this.workspaceId}/labels/${label.id}`,
          { color }
        );

        const updated = res.data?.data || res.data;
        label.color = updated.color;

        this.columns.forEach((col) => {
          col.tasks.forEach((task) => {
            if (task.labelDetails) {
              task.labelDetails = task.labelDetails.map((l) =>
                l.id === label.id ? { ...l, color: updated.color } : l
              );
            }
          });
        });

        this.labels = [...this.labels];
        return updated;
      } catch (err) {
        logBoardError("Update label color failed:", err);
        return null;
      }
    },

    async deleteLabel(name) {
      const label = this.labels.find((l) => l.name === name);
      if (!label) return false;

      try {
        await api.delete(`/workspaces/${this.workspaceId}/labels/${label.id}`);
        this.labels = this.labels.filter((l) => l.id !== label.id);

        this.columns.forEach((col) => {
          col.tasks.forEach((task) => {
            task.labels = (task.labels || []).filter((l) => l !== name);
            task.labelDetails = (task.labelDetails || []).filter(
              (l) => l.name !== name
            );
          });
        });
        return true;
      } catch (err) {
        logBoardError("Delete label failed:", err);
        return false;
      }
    },

    async addTaskLabel(taskId, labelName) {
      const label = this.labels.find((l) => l.name === labelName);
      if (!label) return null;

      try {
        await api.post(
          `/workspaces/${this.workspaceId}/tasks/${taskId}/labels/${label.id}`
        );

        const { task } = findTaskInColumns(this.columns, taskId);
        if (task) {
          const exists = (task.labelDetails || []).some((l) => l.id === label.id);
          if (!exists) {
            task.labelDetails = [...(task.labelDetails || []), label];
            task.labels = task.labelDetails.map((l) => l.name);
          }
        }

        return label;
      } catch (err) {
        logBoardError("Add task label failed:", err);
        return null;
      }
    },

    async removeTaskLabel(taskId, labelName) {
      const label = this.labels.find((l) => l.name === labelName);
      if (!label) return false;

      try {
        await api.delete(
          `/workspaces/${this.workspaceId}/tasks/${taskId}/labels/${label.id}`
        );

        const { task } = findTaskInColumns(this.columns, taskId);
        if (task) {
          task.labelDetails = (task.labelDetails || []).filter(
            (l) => l.id !== label.id
          );
          task.labels = (task.labelDetails || []).map((l) => l.name);
        }
        return true;
      } catch (err) {
        logBoardError("Remove task label failed:", err);
        return false;
      }
    },

    async toggleTaskLabel(taskId, labelName) {
      const label = this.labels.find((l) => l.name === labelName);
      if (!label) return;

      const { task } = findTaskInColumns(this.columns, taskId);
      const hasLabel = (task?.labelDetails || []).some(
        (l) => l.id === label.id || l.name === label.name
      );

      if (hasLabel) await this.removeTaskLabel(taskId, labelName);
      else await this.addTaskLabel(taskId, labelName);
    },

    async loadBoardActivity(workspaceId = this.workspaceId, boardId = this.boardId) {
      if (!isValidId(workspaceId)) {
        this.boardActivity = [];
        return [];
      }
      try {
        const target = isValidId(boardId)
          ? `/audit/board/${boardId}`
          : `/audit/workspace/${workspaceId}`;
        const res = await api.get(target, { params: { limit: 100 } });
        const data = res.data?.data || res.data || [];
        this.boardActivity = data.map((entry) => {
          const details = parseAuditDetails(entry.details);
          return {
            id: entry.id || entry._id,
            action: entry.action || "",
            message: entry.action || entry.details || "Activity",
            details,
            taskId: entry.taskId || details?.taskId || entry.task?.id || null,
            createdAt: entry.createdAt,
          };
        });
        return this.boardActivity;
      } catch (err) {
        logBoardError("Load board activity failed:", err);
        this.boardActivity = [];
        return [];
      }
    },

    async addColumn(title, color) {
      if (!this.workspaceId || !this.boardId) {
        logBoardError("Add column failed:", "Missing workspaceId or boardId");
        return null;
      }

      try {
        const res = await api.post(`/workspaces/${this.workspaceId}/columns`, {
          title,
          color,
          boardId: this.boardId,
        });

        const created = res.data?.data || res.data;

        this.columns.push({
          ...created,
          color: created.color || color || "#6366f1",
          tasks: [],
        });

        return created;
      } catch (err) {
        logBoardError("Add column failed:", err);
        return null;
      }
    },

    async deleteColumn(columnId) {
      if (!this.workspaceId) {
        logBoardError("Delete column failed:", "Missing workspaceId");
        return false;
      }

      try {
        await api.delete(`/workspaces/${this.workspaceId}/columns/${columnId}`);
        this.columns = this.columns.filter((c) => c.id !== columnId);
        return true;
      } catch (err) {
        logBoardError("Delete column failed:", err);
        return false;
      }
    },

    async updateColumn(columnId, payload = {}) {
      if (!this.workspaceId) {
        logBoardError("Update column failed:", "Missing workspaceId");
        return null;
      }

      try {
        const res = await api.patch(
          `/workspaces/${this.workspaceId}/columns/${columnId}`,
          payload
        );
        const updated = res.data?.data || res.data;
        const idx = this.columns.findIndex((c) => c.id === columnId);
        if (idx !== -1) {
          this.columns.splice(idx, 1, {
            ...this.columns[idx],
            ...updated,
            color: updated.color || this.columns[idx]?.color || "#6366f1",
          });
        }
        return updated;
      } catch (err) {
        logBoardError("Update column failed:", err);
        return null;
      }
    },

    async reorderColumn(columnId, order) {
      if (!this.workspaceId) {
        logBoardError("Reorder column failed:", "Missing workspaceId");
        return false;
      }

      try {
        await api.put(
          `/workspaces/${this.workspaceId}/columns/${columnId}/reorder`,
          { order }
        );

        const list = (this.columns || [])
          .slice()
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        const currentIndex = list.findIndex((c) => c.id === columnId);
        if (currentIndex === -1) return true;
        const nextIndex = Math.max(0, Math.min(order, list.length - 1));
        const [moved] = list.splice(currentIndex, 1);
        list.splice(nextIndex, 0, moved);
        this.columns = list.map((col, idx) => ({
          ...col,
          order: idx,
        }));
        return true;
      } catch (err) {
        logBoardError("Reorder column failed:", err);
        return false;
      }
    },

    async uploadAttachment(taskId, file) {
      if (!file) return null;

      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await api.post(
          `/workspaces/${this.workspaceId}/tasks/${taskId}/attachments`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        const attachment = normalizeAttachment(res.data?.data || res.data);
        const { task } = findTaskInColumns(this.columns, taskId);
        if (task) {
          task.attachments = [...(task.attachments || []), attachment];
        }

        return attachment;
      } catch (err) {
        logBoardError("Upload attachment failed:", err);
        return null;
      }
    },

    async deleteAttachment(taskId, attachmentId) {
      try {
        await api.delete(
          `/workspaces/${this.workspaceId}/attachments/${attachmentId}`
        );

        const { task } = findTaskInColumns(this.columns, taskId);
        if (task) {
          task.attachments = (task.attachments || []).filter(
            (a) => a.id !== attachmentId
          );
        }
        return true;
      } catch (err) {
        logBoardError("Delete attachment failed:", err);
        return false;
      }
    },
  },
});

