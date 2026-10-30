import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Necessário para conexões na nuvem (Supabase)
  }
});

// Auto-migração da estrutura da tabela fretes
pool.query(`
  ALTER TABLE fretes 
    ADD COLUMN IF NOT EXISTS peso_kg NUMERIC(10, 2),
    ADD COLUMN IF NOT EXISTS motorista_id UUID,
    ADD COLUMN IF NOT EXISTS veiculo_id UUID,
    ADD COLUMN IF NOT EXISTS codigo_rastreio VARCHAR(50),
    ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'EM_ANDAMENTO';
`)
  .then(() => {
    console.log('✅ Conectado ao Supabase via DATABASE_URL e tabela fretes atualizada!');
  })
  .catch((err) => {
    console.error('❌ Erro na conexão com o Supabase:', err);
  });