import { Router } from 'express';
import { criarMotorista, listarMotoristas } from '../controllers/motoristaController';
import { autenticarToken } from '../middlewares/authMiddleware';

const router = Router();

// Rotas protegidas pelo middleware de autenticação JWT
router.post('/motoristas', autenticarToken, criarMotorista);
router.get('/motoristas', autenticarToken, listarMotoristas);

export default router;