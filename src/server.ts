import express from 'express';
import dotenv from 'dotenv';
import { login } from './controllers/authController';
import financeiroRoutes from './routes/financeiroRoutes';
import freteRoutes from './routes/freteRoutes';
import motoristaRoutes from './routes/motoristaRoutes';
import veiculoRoutes from './routes/veiculoRoutes';

dotenv.config();

const app = express();

app.use(express.json());

// Rota de Autenticação
app.post('/api/login', login);

// Rotas da API
app.use('/api/financeiro', financeiroRoutes);
app.use('/api/fretes', freteRoutes);
app.use('/api/motoristas', motoristaRoutes);
app.use('/api/veiculos', veiculoRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});