import { Router } from 'express';
import { obterResumoDashboard } from '../controllers/dashboardController';
import { autenticarToken } from '../middlewares/authMiddleware';

const router = Router();

router.get('/dashboard', autenticarToken, obterResumoDashboard);

export default router;