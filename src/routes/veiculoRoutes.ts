import { Router } from 'express';
import { autenticarToken } from '../middlewares/authMiddleware';
import {
  listarVeiculos,
  criarVeiculo,
  obterVeiculoPorId,
  atualizarVeiculo,
  deletarVeiculo,
} from '../controllers/veiculoController';

const router = Router();

router.use(autenticarToken);

router.get('/', listarVeiculos);
router.post('/', criarVeiculo);
router.get('/:id', obterVeiculoPorId);
router.put('/:id', atualizarVeiculo);
router.delete('/:id', deletarVeiculo);

export default router;