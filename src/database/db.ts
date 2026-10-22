import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 5,                         // Limite reduzido de conexões simultâneas para o plano gratuito
  idleTimeoutMillis: 5000,        // Fecha conexões ociosas após 5 segundos
  connectionTimeoutMillis: 5000,  // Desiste se a conexão demorar mais de 5s para abrir
});

// Captura erros no pool sem derrubar o processo do Node.js
pool.on('error', (err) => {
  console.error('⚠️ Erro de conexão no pool do PostgreSQL:', err.message);
});

// Função auxiliar para testar e logar a conexão inicial
export const testarConexao = async () => {
  try {
    const client = await pool.connect();
    console.log('⚡ Conectado ao banco PostgreSQL (Supabase) com sucesso!');
    client.release();
  } catch (err: any) {
    console.error('❌ Erro ao conectar ao banco de dados:', err.message);
  }
};

testarConexao();