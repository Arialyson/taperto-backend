import { Router } from 'express';
import { autenticar } from '../middlewares/authMiddleware';
import { criarFrete } from '../controllers/freteController';

const router = Router();

router.use(autenticar);
router.post('/', criarFrete);

export default router;