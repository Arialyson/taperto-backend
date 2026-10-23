import { Response } from 'express';
import { pool } from '../database/db';
import { RequestComUsuario } from '../middlewares/authMiddleware';

// Função para gerar código de rastreio único (ex: TP-8F3A29)
const gerarCodigoRastreio = (): string => {
  const hash = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `TP-${hash}`;
};

// Criar um novo frete
export const criarFrete = async (req: RequestComUsuario, res: Response) => {
  const { motorista_id, veiculo_id, origem_cidade_uf, destino_cidade_uf, nota_fiscal, valor_frete } = req.body;
  const empresa_id = req.usuario?.empresa_id;

  if (!empresa_id) {
    return res.status(401).json({ erro: 'Utilizador não autenticado ou sem empresa vinculada.' });
  }

  if (!origem_cidade_uf || !destino_cidade_uf || !valor_frete) {
    return res.status(400).json({ erro: 'Origem, destino e valor do frete são obrigatórios.' });
  }

  try {
    const codigo_rastreio = gerarCodigoRastreio();

    const query = `
      INSERT INTO fretes (
        empresa_id, motorista_id, veiculo_id, codigo_rastreio,
        origem_cidade_uf, destino_cidade_uf, nota_fiscal, valor_frete
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;

    const values = [
      empresa_id,
      motorista_id || null,
      veiculo_id || null,
      codigo_rastreio,
      origem_cidade_uf,
      destino_cidade_uf,
      nota_fiscal || null,
      valor_frete
    ];

    const result = await pool.query(query, values);

    return res.status(201).json(result.rows[0]);
  } catch (error: any) {
    return res.status(500).json({ erro: 'Erro ao criar frete.', detalhe: error.message });
  }
};

// Listar todos os fretes da empresa do utilizador
export const listarFretes = async (req: RequestComUsuario, res: Response) => {
  const empresa_id = req.usuario?.empresa_id;

  if (!empresa_id) {
    return res.status(401).json({ erro: 'Utilizador não autenticado.' });
  }

  try {
    const query = `
      SELECT 
        f.*,
        m.nome AS nome_motorista,
        v.placa AS placa_veiculo,
        v.modelo AS modelo_veiculo
      FROM fretes f
      LEFT JOIN motoristas m ON f.motorista_id = m.id
      LEFT JOIN veiculos v ON f.veiculo_id = v.id
      WHERE f.empresa_id = $1
      ORDER BY f.created_at DESC;
    `;

    const result = await pool.query(query, [empresa_id]);

    return res.json(result.rows);
  } catch (error: any) {
    return res.status(500).json({ erro: 'Erro ao listar fretes.', detalhe: error.message });
  }
};