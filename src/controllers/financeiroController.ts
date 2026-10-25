import { Request, Response } from 'express';
import { pool } from '../database/db';

export const criarLancamento = async (req: Request, res: Response) => {
  try {
    const usuario = (req as any).usuario;
    const { descricao, valor, tipo, categoria, data_vencimento, status } = req.body;

    const query = `
      INSERT INTO financeiro (empresa_id, descricao, valor, tipo, categoria, data_vencimento, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const values = [
      usuario.empresa_id,
      descricao,
      valor,
      tipo,
      categoria,
      data_vencimento,
      status || 'PENDENTE'
    ];

    const result = await pool.query(query, values);
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar lançamento:', error);
    return res.status(500).json({ mensagem: 'Erro interno do servidor.' });
  }
};

export const listarLancamentos = async (req: Request, res: Response) => {
  try {
    const usuario = (req as any).usuario;
    const query = 'SELECT * FROM financeiro WHERE empresa_id = $1 ORDER BY created_at DESC';
    const result = await pool.query(query, [usuario.empresa_id]);

    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao listar lançamentos:', error);
    return res.status(500).json({ mensagem: 'Erro interno do servidor.' });
  }
};

export const atualizarLancamento = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const usuario = (req as any).usuario;
    const { descricao, valor, tipo, categoria, data_vencimento, status } = req.body;

    const query = `
      UPDATE financeiro
      SET descricao = COALESCE($1, descricao),
          valor = COALESCE($2, valor),
          tipo = COALESCE($3, tipo),
          categoria = COALESCE($4, categoria),
          data_vencimento = COALESCE($5, data_vencimento),
          status = COALESCE($6, status)
      WHERE id = $7 AND empresa_id = $8
      RETURNING *
    `;

    const result = await pool.query(query, [
      descricao,
      valor,
      tipo,
      categoria,
      data_vencimento,
      status,
      id,
      usuario.empresa_id
    ]);

    if (result.rowCount === 0) {
      return res.status(404).json({ mensagem: 'Lançamento não encontrado ou sem permissão.' });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar lançamento:', error);
    return res.status(500).json({ mensagem: 'Erro interno do servidor.' });
  }
};

export const deletarLancamento = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const usuario = (req as any).usuario;

    const query = 'DELETE FROM financeiro WHERE id = $1 AND empresa_id = $2 RETURNING *';
    const result = await pool.query(query, [id, usuario.empresa_id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ mensagem: 'Lançamento não encontrado ou sem permissão.' });
    }

    return res.status(200).json({ mensagem: 'Lançamento excluído com sucesso.' });
  } catch (error) {
    console.error('Erro ao deletar lançamento:', error);
    return res.status(500).json({ mensagem: 'Erro interno do servidor.' });
  }
};