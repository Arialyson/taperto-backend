import { Router } from 'express';
import { autenticarToken } from '../middlewares/authMiddleware';
import {
  listarMotoristas,
  criarMotorista,
  obterMotoristaPorId,
  atualizarMotorista,
  deletarMotorista,
} from '../controllers/motoristaController';

const router = Router();

router.use(autenticarToken);

router.get('/', listarMotoristas);
router.post('/', criarMotorista);
router.get('/:id', obterMotoristaPorId);
router.put('/:id', atualizarMotorista);
router.delete('/:id', deletarMotorista);

export default router;