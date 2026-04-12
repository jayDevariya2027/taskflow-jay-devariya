import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { listUsers } from '../controllers/user.controller';

const router = Router();
router.use(authenticate);
router.get('/', listUsers);

export default router;