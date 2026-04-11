import { Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth';
import {
  getProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
} from '../services/project.service';

const createProjectSchema = z.object({
  name: z.string().min(1, 'name is required'),
  description: z.string().optional(),
});

const updateProjectSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
});

export const listProjects = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const projects = await getProjects(req.user!.user_id);
    res.status(200).json({ projects });
  } catch (err: any) {
    if (err.status) {
      res.status(err.status).json({ error: err.message });
      return;
    }
    res.status(500).json({ error: 'internal server error' });
  }
};

export const createProjectHandler = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const result = createProjectSchema.safeParse(req.body);

  if (!result.success) {
    const fields: Record<string, string> = {};
    result.error.errors.forEach((e) => {
      fields[e.path[0] as string] = e.message;
    });
    res.status(400).json({ error: 'validation failed', fields });
    return;
  }

  try {
    const { name, description } = result.data;
    const project = await createProject(name, description, req.user!.user_id);
    res.status(201).json({ project });
  } catch (err: any) {
    if (err.status) {
      res.status(err.status).json({ error: err.message });
      return;
    }
    res.status(500).json({ error: 'internal server error' });
  }
};

export const getProject = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const project = await getProjectById(req.params.id, req.user!.user_id);
    res.status(200).json({ project });
  } catch (err: any) {
    if (err.status) {
      res.status(err.status).json({ error: err.message });
      return;
    }
    res.status(500).json({ error: 'internal server error' });
  }
};

export const updateProjectHandler = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const result = updateProjectSchema.safeParse(req.body);

  if (!result.success) {
    const fields: Record<string, string> = {};
    result.error.errors.forEach((e) => {
      fields[e.path[0] as string] = e.message;
    });
    res.status(400).json({ error: 'validation failed', fields });
    return;
  }

  try {
    const { name, description } = result.data;
    const project = await updateProject(
      req.params.id,
      req.user!.user_id,
      name,
      description
    );
    res.status(200).json({ project });
  } catch (err: any) {
    if (err.status) {
      res.status(err.status).json({ error: err.message });
      return;
    }
    res.status(500).json({ error: 'internal server error' });
  }
};

export const deleteProjectHandler = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    await deleteProject(req.params.id, req.user!.user_id);
    res.status(204).send();
  } catch (err: any) {
    if (err.status) {
      res.status(err.status).json({ error: err.message });
      return;
    }
    res.status(500).json({ error: 'internal server error' });
  }
};