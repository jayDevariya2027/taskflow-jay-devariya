import api from './axios';
import { type Task } from '../types';

export const getTasks = async (
  projectId: string,
  filters?: { status?: string; assignee?: string }
): Promise<Task[]> => {
  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.assignee) params.append('assignee', filters.assignee);
  const res = await api.get(`/projects/${projectId}/tasks?${params}`);
  return res.data.tasks;
};

export const createTask = async (
  projectId: string,
  data: {
    title: string;
    description?: string;
    status?: string;
    priority?: string;
    assignee_id?: string;
    due_date?: string;
  }
): Promise<Task> => {
  const res = await api.post(`/projects/${projectId}/tasks`, data);
  return res.data.task;
};

export const updateTask = async (
  taskId: string,
  data: {
    title?: string;
    description?: string;
    status?: string;
    priority?: string;
    assignee_id?: string;
    due_date?: string;
  }
): Promise<Task> => {
  const res = await api.patch(`/tasks/${taskId}`, data);
  return res.data.task;
};

export const deleteTask = async (taskId: string): Promise<void> => {
  await api.delete(`/tasks/${taskId}`);
};