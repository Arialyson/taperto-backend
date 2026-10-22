import express from 'express';
import dotenv from 'dotenv';
import empresaRoutes from './routes/empresaRoutes';
import usuarioRoutes from './routes/usuarioRoutes'; // <-- Adicionar esta linha

dotenv.config();

const app = express();
app.use(express.json());

// Registar Rotas
app.use('/api', empresaRoutes);
app.use('/api', usuarioRoutes); // <-- Adicionar esta linha

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});