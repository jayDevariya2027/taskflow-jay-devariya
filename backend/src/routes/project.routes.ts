import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  listProjects,
  createProjectHandler,
  getProject,
  updateProjectHandler,
  deleteProjectHandler,
} from '../controllers/project.controller';

const router = Router();

router.use(authenticate);

router.get('/', listProjects);
router.post('/', createProjectHandler);
router.get('/:id', getProject);
router.patch('/:id', updateProjectHandler);
router.delete('/:id', deleteProjectHandler);

export default router;