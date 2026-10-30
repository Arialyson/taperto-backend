import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { pool } from '../database/db';

export const listarFretes = async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT * FROM fretes WHERE empresa_id = $1',
      [req.empresaId]
    );
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao listar fretes:', error);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
};

export const criarFrete = async (req: AuthRequest, res: Response) => {
  try {
    const { origem, destino, valor } = req.body;

    const result = await pool.query(
      `INSERT INTO fretes (empresa_id, origem, destino, origem_cidade_uf, destino_cidade_uf, valor)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [req.empresaId, origem, destino, origem, destino, valor]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar frete:', error);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
};

export const atribuirFrete = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { motorista_id, veiculo_id, status } = req.body;

    const result = await pool.query(
      `UPDATE fretes
       SET motorista_id = $1, veiculo_id = $2, status = COALESCE($3, 'Em Trânsito')
       WHERE id = $4 AND empresa_id = $5
       RETURNING *`,
      [motorista_id, veiculo_id, status, id, req.empresaId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Frete não encontrado para atualização.' });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atribuir frete:', error);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
};