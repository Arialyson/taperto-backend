require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'taperto_db',
  password: process.env.DB_PASSWORD || 'postgres',
  port: Number(process.env.DB_PORT) || 5432,
});

async function atualizarTabelaFretes() {
  try {
    await pool.query(`
      ALTER TABLE fretes 
        ADD COLUMN IF NOT EXISTS peso_kg NUMERIC(10, 2),
        ADD COLUMN IF NOT EXISTS motorista_id UUID,
        ADD COLUMN IF NOT EXISTS veiculo_id UUID,
        ADD COLUMN IF NOT EXISTS codigo_rastreio VARCHAR(50),
        ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'EM_ANDAMENTO';
    `);
    console.log('✅ Tabela fretes atualizada com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao atualizar tabela:', error);
  } finally {
    await pool.end();
  }
}

atualizarTabelaFretes();