import express from 'express';
import dotenv from 'dotenv';
import empresaRoutes from './routes/empresaRoutes';
import usuarioRoutes from './routes/usuarioRoutes';
import authRoutes from './routes/authRoutes';
import veiculoRoutes from './routes/veiculoRoutes';
import motoristaRoutes from './routes/motoristaRoutes';
import freteRoutes from './routes/freteRoutes';

dotenv.config();

const app = express();
app.use(express.json());

// Registar Rotas
app.use('/api', empresaRoutes);
app.use('/api', usuarioRoutes);
app.use('/api', authRoutes);
app.use('/api', veiculoRoutes);
app.use('/api', motoristaRoutes);
app.use('/api', freteRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});