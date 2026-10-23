import { Router } from 'express';
import { 
  criarFrete, 
  listarFretes, 
  atualizarStatusFrete, 
  rastrearFretePublico 
} from '../controllers/freteController';
import { autenticarToken } from '../middlewares/authMiddleware';

const router = Router();

// Rota pública para cliente final rastrear encomenda
router.get('/fretes/rastreio/:codigo', rastrearFretePublico);

// Rotas protegidas (exigem Token JWT)
router.post('/fretes', autenticarToken, criarFrete);
router.get('/fretes', autenticarToken, listarFretes);
router.patch('/fretes/:id/status', autenticarToken, atualizarStatusFrete);

export default router;