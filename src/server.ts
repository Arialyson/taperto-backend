import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import empresaRoutes from './routes/empresaRoutes';
import usuarioRoutes from './routes/usuarioRoutes';
import veiculoRoutes from './routes/veiculoRoutes';
import motoristaRoutes from './routes/motoristaRoutes';
import clienteRoutes from './routes/clienteRoutes';
import freteRoutes from './routes/freteRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import financeiroRoutes from './routes/financeiroRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Rotas da API
app.use('/api', authRoutes);
app.use('/api', empresaRoutes);
app.use('/api', usuarioRoutes);
app.use('/api', veiculoRoutes);
app.use('/api', motoristaRoutes);
app.use('/api', clienteRoutes);
app.use('/api', freteRoutes);
app.use('/api', dashboardRoutes);
app.use('/api', financeiroRoutes);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});