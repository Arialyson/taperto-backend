import { Router } from 'express';
import { autenticarToken } from '../middlewares/authMiddleware';
import { listarFretes, criarFrete, atribuirFrete } from '../controllers/freteController';

const router = Router();

router.use(autenticarToken);

router.get('/', listarFretes);
router.post('/', criarFrete);
router.patch('/:id/atribuir', atribuirFrete);

export default router;