import { Router } from 'express';
import { criarFrete, listarFretes } from '../controllers/freteController';
import { autenticarToken } from '../middlewares/authMiddleware';

const router = Router();

router.post('/fretes', autenticarToken, criarFrete);
router.get('/fretes', autenticarToken, listarFretes);

export default router;