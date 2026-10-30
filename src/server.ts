import express from 'express';
import dotenv from 'dotenv';
import empresaRoutes from './routes/empresaRoutes';
import freteRoutes from './routes/freteRoutes';
import veiculoRoutes from './routes/veiculoRoutes';
import motoristaRoutes from './routes/motoristaRoutes';
import authRoutes from './routes/authRoutes';

dotenv.config();

const app = express();

app.use(express.json());

// Mapeamento das rotas da API
app.use('/api/empresas', empresaRoutes);
app.use('/api/fretes', freteRoutes);
app.use('/api/veiculos', veiculoRoutes);
app.use('/api/motoristas', motoristaRoutes);
app.use('/api', authRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});