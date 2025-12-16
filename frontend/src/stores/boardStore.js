// frontend/src/stores/boardStore.js
import { defineStore } from "pinia";
import api from "@/api.js";

/* ======================================================
   NORMALIZERS (UNCHANGED)
====================================================== */

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

/* ======================================================
   STORE
====================================================== */

export const useBoardStore = defineStore("board", {
  state: () => ({
    // 🔥 ADDED (board list support)
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
    /* ======================================================
       BOARD LIST (🔥 MISSING BEFORE — NOW FIXED)
    ====================================================== */

    async loadBoards(workspaceId) {
      this.workspaceId = workspaceId;
      const res = await api.get(`/workspaces/${workspaceId}/board`);
      this.boards = res.data?.data || res.data || [];
      return this.boards;
    },

    async createBoard(workspaceId, name, icon, color) {
      const res = await api.post(`/workspaces/${workspaceId}/board`, {
        name,
        icon,
        color,
      });
      const board = res.data?.data || res.data;
      this.boards.push(board);
      return board;
    },

    async updateBoard(workspaceId, boardId, payload) {
      const res = await api.patch(
        `/workspaces/${workspaceId}/board/${boardId}`,
        payload
      );
      const updated = res.data?.data || res.data;
      const idx = this.boards.findIndex((b) => b.id === boardId);
      if (idx !== -1) this.boards.splice(idx, 1, updated);
      return updated;
    },

    async deleteBoard(workspaceId, boardId) {
      await api.delete(`/workspaces/${workspaceId}/board/${boardId}`);
      this.boards = this.boards.filter((b) => b.id !== boardId);
    },

    

    /* ======================================================
       SINGLE BOARD LOAD (FIXED ENDPOINT)
    ====================================================== */

    async loadBoard(workspaceId, boardId) {
      if (!workspaceId || !boardId) {
        throw new Error("workspaceId and boardId are required to load a board");
      }
      this.workspaceId = workspaceId;
      this.boardId = boardId;

      const res = await api.get(`/workspaces/${workspaceId}/board/${boardId}`);



      const board = res.data?.data || res.data;
      this.currentBoard = board;

      this.columns = (board.columns || []).map((c) => ({
        ...c,
        color: c.color || "#6366f1",
        tasks: (c.tasks || []).map(normalizeTask),
      }));

      try {
        await this.loadLabels();
      } catch (err) {
        console.error("Load labels error:", err);
        this.labels = extractLabelsFromColumns(this.columns);
      }

      try {
        await this.loadBoardActivity(workspaceId);
      } catch (err) {
        console.error("Load board activity error:", err);
      }

      return board;
    },

    /* ======================================================
       TASKS
    ====================================================== */

    async addTask(columnId, payload) {
      if (!this.workspaceId) {
        throw new Error("Missing workspaceId");
      }

      const { title, description, dueDate, priority, assigneeId } = payload || {};

      const body = {
        title,
        description,
        dueDate,
        priority: priority ? String(priority).toUpperCase() : undefined,
        assigneeId,
      };

      const res = await api.post(
        `/workspaces/${this.workspaceId}/columns/${columnId}/tasks`,
        body
      );

      const task = normalizeTask(res.data?.data || res.data);
      const column = this.columns.find((c) => c.id === columnId);
      if (column) {
        column.tasks = [...(column.tasks || []), task];
      }

      // follow-up: labels
      if (Array.isArray(payload?.labels)) {
        for (const name of payload.labels) {
          try {
            await this.addTaskLabel(task.id, name);
          } catch (err) {
            console.error("Add task label failed:", err);
          }
        }
      }

      // follow-up: kickoff comment
      if (payload?.comment?.trim()) {
        try {
          await this.addComment(task.id, { content: payload.comment.trim() });
        } catch (err) {
          console.error("Add task comment failed:", err);
        }
      }

      // follow-up: attachments
      if (Array.isArray(payload?.attachments) && payload.attachments.length) {
        for (const file of payload.attachments) {
          if (!file) continue;
          try {
            await this.uploadAttachment(task.id, file);
          } catch (err) {
            console.error("Upload attachment failed:", err);
          }
        }
      }

      return task;
    },

    async updateTask(taskId, updates) {
      if (!this.workspaceId) {
        throw new Error("Missing workspaceId");
      }

      const payload = {
        ...updates,
      };

      if (payload.priority) {
        payload.priority = String(payload.priority).toUpperCase();
      }

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
    },

    async moveTask(taskId, targetColumnId) {
      if (!this.workspaceId) {
        throw new Error("Missing workspaceId");
      }

      await api.put(`/workspaces/${this.workspaceId}/tasks/${taskId}/move`, {
        targetColumnId,
      });

      const { task, column } = findTaskInColumns(this.columns, taskId);
      if (column) {
        column.tasks = (column.tasks || []).filter((t) => t.id !== taskId);
      }

      const target = this.columns.find((c) => c.id === targetColumnId);
      if (target && task) {
        target.tasks = [...(target.tasks || []), { ...task, columnId: targetColumnId }];
      } else if (!target) {
        await this.loadBoard(this.workspaceId, this.boardId);
      }
    },

    async deleteTask(taskId, columnId = null) {
      if (!this.workspaceId) {
        throw new Error("Missing workspaceId");
      }

      await api.delete(`/workspaces/${this.workspaceId}/tasks/${taskId}`);

      const { column } = columnId
        ? { column: this.columns.find((c) => c.id === columnId) }
        : findTaskInColumns(this.columns, taskId);

      if (column) {
        column.tasks = (column.tasks || []).filter((t) => t.id !== taskId);
      }
    },

    /* ======================================================
       COMMENTS
    ====================================================== */

    async addComment(taskId, payload = {}) {
      if (!this.workspaceId) {
        throw new Error("Missing workspaceId");
      }

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
    },

    /* ======================================================
       LABELS (UNCHANGED)
    ====================================================== */

    async loadLabels() {
      if (!this.workspaceId) return [];
      const res = await api.get(`/workspaces/${this.workspaceId}/labels`);
      const labels = res.data?.data || res.data || [];
      this.labels = labels.map((label) => ({
        ...label,
        color: label.color || "#6366f1",
      }));
      return this.labels;
    },

    async createLabel(name, color) {
      const res = await api.post(`/workspaces/${this.workspaceId}/labels`, {
        name,
        color,
      });
      const label = res.data?.data || res.data;
      this.labels.push(label);
      return label;
    },

    async updateLabelName(oldName, newName) {
      const label = this.labels.find((l) => l.name === oldName);
      if (!label) return;

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
    },

    async updateLabelColor(name, color) {
      const label = this.labels.find((l) => l.name === name);
      if (!label) return;

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
    },

    async deleteLabel(name) {
      const label = this.labels.find((l) => l.name === name);
      if (!label) return;

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
    },

    /* ======================================================
       TASK LABEL ASSIGNMENT
    ====================================================== */

    async addTaskLabel(taskId, labelName) {
      const label = this.labels.find((l) => l.name === labelName);
      if (!label) return;

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
    },

    async removeTaskLabel(taskId, labelName) {
      const label = this.labels.find((l) => l.name === labelName);
      if (!label) return;

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

    async loadBoardActivity(workspaceId = this.workspaceId) {
      const res = await api.get(`/audit/workspace/${workspaceId}`, {
        params: { limit: 50 },
      });
      const data = res.data?.data || res.data || [];
      this.boardActivity = data.map((entry) => ({
        id: entry.id,
        message: entry.action || entry.details || "Activity",
        createdAt: entry.createdAt,
      }));
      return this.boardActivity;
    },

    /* ======================================================
       COLUMNS
    ====================================================== */

    async addColumn(title, color) {
      if (!this.workspaceId || !this.boardId) {
        throw new Error("Missing workspaceId or boardId");
      }

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
    },

    async deleteColumn(columnId) {
      if (!this.workspaceId) {
        throw new Error("Missing workspaceId");
      }

      await api.delete(`/workspaces/${this.workspaceId}/columns/${columnId}`);
      this.columns = this.columns.filter((c) => c.id !== columnId);
    },

    /* ======================================================
       ATTACHMENTS
    ====================================================== */

    async uploadAttachment(taskId, file) {
      if (!file) return null;

      const formData = new FormData();
      formData.append("file", file);

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
    },

    async deleteAttachment(taskId, attachmentId) {
      await api.delete(
        `/workspaces/${this.workspaceId}/attachments/${attachmentId}`
      );

      const { task } = findTaskInColumns(this.columns, taskId);
      if (task) {
        task.attachments = (task.attachments || []).filter(
          (a) => a.id !== attachmentId
        );
      }
    },
  },
});
