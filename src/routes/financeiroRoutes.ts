import { Router } from 'express';
import { 
  criarLancamentoFinanceiro, 
  listarFinanceiro, 
  atualizarStatusFinanceiro 
} from '../controllers/financeiroController';
import { autenticarToken } from '../middlewares/authMiddleware';
import { validarBody } from '../middlewares/validarSchema';
import { 
  criarLancamentoFinanceiroSchema, 
  atualizarStatusFinanceiroSchema 
} from '../schemas/financeiroSchema';

const router = Router();

router.post('/financeiro', autenticarToken, validarBody(criarLancamentoFinanceiroSchema), criarLancamentoFinanceiro);
router.get('/financeiro', autenticarToken, listarFinanceiro);
router.patch('/financeiro/:id/status', autenticarToken, validarBody(atualizarStatusFinanceiroSchema), atualizarStatusFinanceiro);

export default router;