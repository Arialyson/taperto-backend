import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 5,
  idleTimeoutMillis: 5000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('⚠️ Erro de conexão no pool do PostgreSQL:', err.message);
});

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