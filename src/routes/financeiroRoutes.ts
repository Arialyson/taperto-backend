import { Router } from 'express';
import { autenticar } from '../middlewares/authMiddleware';
import {
  criarLancamento,
  listarLancamentos,
  atualizarLancamento,
  deletarLancamento
} from '../controllers/financeiroController';

const router = Router();

router.use(autenticar);

router.post('/', criarLancamento);
router.get('/', listarLancamentos);
router.put('/:id', atualizarLancamento);
router.delete('/:id', deletarLancamento);

export default router;