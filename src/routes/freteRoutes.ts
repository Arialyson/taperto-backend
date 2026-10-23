import { Router } from 'express';
import { 
  criarFrete, 
  listarFretes, 
  atualizarStatusFrete, 
  rastrearFretePublico 
} from '../controllers/freteController';
import { autenticarToken } from '../middlewares/authMiddleware';
import { validarBody } from '../middlewares/validarSchema';
import { criarFreteSchema, atualizarStatusSchema } from '../schemas/freteSchema';

const router = Router();

// Rota pública de rastreio
router.get('/fretes/rastreio/:codigo', rastrearFretePublico);

// Rotas protegidas por JWT + Validação de Schema
router.post('/fretes', autenticarToken, validarBody(criarFreteSchema), criarFrete);
router.get('/fretes', autenticarToken, listarFretes);
router.patch('/fretes/:id/status', autenticarToken, validarBody(atualizarStatusSchema), atualizarStatusFrete);

export default router;