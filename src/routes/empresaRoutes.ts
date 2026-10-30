import { Router } from 'express';
import {
  criarEmpresa,
  listarEmpresas,
  obterEmpresaPorId,
  atualizarEmpresa,
  deletarEmpresa
} from '../controllers/empresaController';

const router = Router();

router.post('/', criarEmpresa);
router.get('/', listarEmpresas);
router.get('/:id', obterEmpresaPorId);
router.put('/:id', atualizarEmpresa);
router.delete('/:id', deletarEmpresa);

export default router;