import { Router } from 'express';
import { criarVeiculo, listarVeiculos } from '../controllers/veiculoController';
import { autenticarToken } from '../middlewares/authMiddleware';

const router = Router();

// Rotas protegidas pelo middleware de autenticação JWT
router.post('/veiculos', autenticarToken, criarVeiculo);
router.get('/veiculos', autenticarToken, listarVeiculos);

export default router;