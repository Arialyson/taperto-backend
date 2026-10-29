import { Router } from 'express';
import { criarMotorista, listarMotoristas } from '../controllers/motoristaController';
import { autenticar } from '../middlewares/authMiddleware';

const router = Router();

// Aplica o middleware de autenticação JWT em todas as rotas do módulo
router.use(autenticar);

router.post('/', criarMotorista);
router.get('/', listarMotoristas);

export default router;