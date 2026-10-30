import { Router } from 'express';
import { 
  criarVeiculo, 
  listarVeiculos, 
  obterVeiculoPorId, 
  atualizarVeiculo, 
  deletarVeiculo 
} from '../controllers/veiculoController';
import { autenticar } from '../middlewares/authMiddleware';

const router = Router();

router.use(autenticar);

router.post('/', criarVeiculo);
router.get('/', listarVeiculos);
router.get('/:id', obterVeiculoPorId);
router.put('/:id', atualizarVeiculo);
router.delete('/:id', deletarVeiculo);

export default router;