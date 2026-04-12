import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { getAllUsers } from '../services/user.service';

export const listUsers = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const users = await getAllUsers();
    res.status(200).json({ users });
  } catch (err: any) {
    res.status(500).json({ error: 'internal server error' });
  }
};