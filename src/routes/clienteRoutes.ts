import { Router } from 'express';
import { criarCliente, listarClientes } from '../controllers/clienteController';
import { autenticarToken } from '../middlewares/authMiddleware';

const router = Router();

router.post('/clientes', autenticarToken, criarCliente);
router.get('/clientes', autenticarToken, listarClientes);

export default router;