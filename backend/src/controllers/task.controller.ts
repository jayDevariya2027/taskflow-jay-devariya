import { Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth';
import {
  getTasksByProject,
  createTask,
  updateTask,
  deleteTask,
} from '../services/task.service';

const createTaskSchema = z.object({
  title: z.string().min(1, 'title is required'),
  description: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'done']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  assignee_id: z
    .union([z.string().uuid('assignee_id must be a valid uuid'), z.literal('')])
    .optional(),
  due_date: z.string().optional(),
});

const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'done']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  assignee_id: z
    .union([z.string().uuid('assignee_id must be a valid uuid'), z.literal('')])
    .optional(),
  due_date: z.string().optional(),
});

export const listTasks = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { status, assignee } = req.query as {
      status?: string;
      assignee?: string;
    };

    const tasks = await getTasksByProject(
      req.params.id,
      status,
      assignee
    );
    res.status(200).json({ tasks });
  } catch (err: any) {
    if (err.status) {
      res.status(err.status).json({ error: err.message });
      return;
    }
    res.status(500).json({ error: 'internal server error' });
  }
};

export const createTaskHandler = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const result = createTaskSchema.safeParse(req.body);

  if (!result.success) {
    const fields: Record<string, string> = {};
    result.error.errors.forEach((e) => {
      fields[e.path[0] as string] = e.message;
    });
    res.status(400).json({ error: 'validation failed', fields });
    return;
  }

  try {
    const task = await createTask(
      req.params.id,
      req.user!.user_id,
      result.data
    );
    res.status(201).json({ task });
  } catch (err: any) {
    if (err.status) {
      res.status(err.status).json({ error: err.message });
      return;
    }
    res.status(500).json({ error: 'internal server error' });
  }
};

export const updateTaskHandler = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const result = updateTaskSchema.safeParse(req.body);

  if (!result.success) {
    const fields: Record<string, string> = {};
    result.error.errors.forEach((e) => {
      fields[e.path[0] as string] = e.message;
    });
    res.status(400).json({ error: 'validation failed', fields });
    return;
  }

  try {
    const task = await updateTask(
      req.params.id,
      req.user!.user_id,
      result.data
    );
    res.status(200).json({ task });
  } catch (err: any) {
    if (err.status) {
      res.status(err.status).json({ error: err.message });
      return;
    }
    res.status(500).json({ error: 'internal server error' });
  }
};

export const deleteTaskHandler = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    await deleteTask(req.params.id, req.user!.user_id);
    res.status(204).send();
  } catch (err: any) {
    if (err.status) {
      res.status(err.status).json({ error: err.message });
      return;
    }
    res.status(500).json({ error: 'internal server error' });
  }
};