import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import './database/db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  return res.json({ status: 'OK', message: 'API TáPerto rodando perfeitamente!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});