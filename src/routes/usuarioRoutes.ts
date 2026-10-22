import { Router } from 'express';
import { criarUsuario, listarUsuariosPorEmpresa } from '../controllers/usuarioController';

const router = Router();

router.post('/usuarios', criarUsuario);
router.get('/empresas/:empresa_id/usuarios', listarUsuariosPorEmpresa);

export default router;