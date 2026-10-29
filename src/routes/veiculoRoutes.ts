import { Router } from 'express';
import { criarVeiculo, listarVeiculos } from '../controllers/veiculoController';
import { autenticar } from '../middlewares/authMiddleware';

const router = Router();

router.use(autenticar);

router.post('/', criarVeiculo);
router.get('/', listarVeiculos);

export default router;