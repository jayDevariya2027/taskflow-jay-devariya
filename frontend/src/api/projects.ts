import api from './axios';
import { type Project } from '../types';

export const getProjects = async (): Promise<Project[]> => {
  const res = await api.get('/projects');
  return res.data.projects;
};

export const getProject = async (id: string): Promise<Project> => {
  const res = await api.get(`/projects/${id}`);
  return res.data.project;
};

export const createProject = async (
  name: string,
  description?: string
): Promise<Project> => {
  const res = await api.post('/projects', { name, description });
  return res.data.project;
};

export const updateProject = async (
  id: string,
  data: { name?: string; description?: string }
): Promise<Project> => {
  const res = await api.patch(`/projects/${id}`, data);
  return res.data.project;
};

export const deleteProject = async (id: string): Promise<void> => {
  await api.delete(`/projects/${id}`);
};