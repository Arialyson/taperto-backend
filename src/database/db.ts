import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.connect()
  .then(client => {
    console.log('⚡ Conectado ao banco PostgreSQL (Supabase) com sucesso!');
    client.release();
  })
  .catch(err => {
    console.error('❌ Erro ao conectar ao banco de dados:', err.stack);
  });