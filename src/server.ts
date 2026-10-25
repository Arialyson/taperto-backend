import express from 'express';
import dotenv from 'dotenv';
import { login } from './controllers/authController';
import financeiroRoutes from './routes/financeiroRoutes';
import freteRoutes from './routes/freteRoutes';

dotenv.config();

const app = express();

app.use(express.json());

// Rota de Autenticação
app.post('/api/login', login);

// Rotas dos Módulos
app.use('/api/financeiro', financeiroRoutes);
app.use('/api/fretes', freteRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});