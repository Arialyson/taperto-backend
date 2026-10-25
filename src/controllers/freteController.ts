import { Response } from 'express';
import { pool } from '../database/db';
import { RequestComUsuario } from '../middlewares/authMiddleware';

const gerarCodigoRastreio = (): string => {
  const hash = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `TP_${hash}`;
};

export const criarFrete = async (req: RequestComUsuario, res: Response) => {
  try {
    const usuario = req.usuario;

    if (!usuario) {
      return res.status(401).json({ erro: 'Utilizador não autenticado.' });
    }

    const {
      motorista_id,
      veiculo_id,
      cliente_id,
      origem_cidade_uf,
      destino_cidade_uf,
      valor_frete,
      status
    } = req.body;

    const codigo_rastreio = gerarCodigoRastreio();

    const query = `
      INSERT INTO fretes (
        empresa_id, motorista_id, veiculo_id, cliente_id,
        origem_cidade_uf, destino_cidade_uf, valor_frete,
        codigo_rastreio, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const values = [
      usuario.empresa_id,
      motorista_id || null,
      veiculo_id || null,
      cliente_id || null,
      origem_cidade_uf,
      destino_cidade_uf,
      valor_frete,
      codigo_rastreio,
      status || 'EM_TRANSITO'
    ];

    const result = await pool.query(query, values);
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar frete:', error);
    return res.status(500).json({ mensagem: 'Erro interno do servidor.' });
  }
};