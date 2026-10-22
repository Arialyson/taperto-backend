import { Router } from 'express';
import {
  criarEmpresa,
  listarEmpresas,
  obterEmpresaPorId,
  atualizarEmpresa,
  deletarEmpresa
} from '../controllers/empresaController';

const router = Router();

router.post('/empresas', criarEmpresa);
router.get('/empresas', listarEmpresas);
router.get('/empresas/:id', obterEmpresaPorId);
router.put('/empresas/:id', atualizarEmpresa);
router.delete('/empresas/:id', deletarEmpresa);

export default router;