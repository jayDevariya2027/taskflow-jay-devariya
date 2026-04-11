import { Request, Response } from 'express';
import { z } from 'zod';
import { registerUser, loginUser } from '../services/auth.service';

const registerSchema = z.object({
  name: z.string().min(1, 'name is required'),
  email: z.string().email('email is invalid'),
  password: z.string().min(6, 'password must be at least 6 characters'),
});

const loginSchema = z.object({
  email: z.string().email('email is invalid'),
  password: z.string().min(1, 'password is required'),
});

export const register = async (req: Request, res: Response): Promise<void> => {
  const result = registerSchema.safeParse(req.body);

  if (!result.success) {
    const fields: Record<string, string> = {};
    result.error.errors.forEach((e) => {
      fields[e.path[0] as string] = e.message;
    });
    res.status(400).json({ error: 'validation failed', fields });
    return;
  }

  try {
    const { name, email, password } = result.data;
    const user = await registerUser(name, email, password);
    res.status(201).json({ user });
  } catch (err: any) {
    if (err.status) {
      res.status(err.status).json({ error: err.message });
      return;
    }
    res.status(500).json({ error: 'internal server error' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const result = loginSchema.safeParse(req.body);

  if (!result.success) {
    const fields: Record<string, string> = {};
    result.error.errors.forEach((e) => {
      fields[e.path[0] as string] = e.message;
    });
    res.status(400).json({ error: 'validation failed', fields });
    return;
  }

  try {
    const { email, password } = result.data;
    const data = await loginUser(email, password);
    res.status(200).json(data);
  } catch (err: any) {
    if (err.status) {
      res.status(err.status).json({ error: err.message });
      return;
    }
    res.status(500).json({ error: 'internal server error' });
  }
};