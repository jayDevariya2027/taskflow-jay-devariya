import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  listTasks,
  createTaskHandler,
  updateTaskHandler,
  deleteTaskHandler,
} from '../controllers/task.controller';

const router = Router();

router.use(authenticate);

// Nested under projects
router.get('/projects/:id/tasks', listTasks);
router.post('/projects/:id/tasks', createTaskHandler);

// Top level task routes
router.patch('/tasks/:id', updateTaskHandler);
router.delete('/tasks/:id', deleteTaskHandler);

export default router;