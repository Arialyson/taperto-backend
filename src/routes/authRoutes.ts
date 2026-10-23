import { Router } from 'express';
import { login, obterPerfil } from '../controllers/authController';
import { autenticarToken } from '../middlewares/authMiddleware';

const router = Router();

// Rota pública de login
router.post('/auth/login', login);

// Rota protegida (requer Token JWT no cabeçalho)
router.get('/auth/me', autenticarToken, obterPerfil);

export default router;