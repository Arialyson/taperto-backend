import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { pool } from '../database/db';

export const listarMotoristas = async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT * FROM motoristas WHERE empresa_id = $1',
      [req.empresaId]
    );
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao listar motoristas:', error);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
};

export const criarMotorista = async (req: AuthRequest, res: Response) => {
  try {
    const { nome, cnh, telefone } = req.body;

    const result = await pool.query(
      `INSERT INTO motoristas (empresa_id, nome, cnh, telefone)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [req.empresaId, nome, cnh, telefone]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error('Erro ao criar motorista:', error);

    if (error.code === '23505') {
      return res.status(409).json({ erro: 'Já existe um motorista cadastrado com esta CNH.' });
    }

    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
};

export const obterMotoristaPorId = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM motoristas WHERE id = $1 AND empresa_id = $2',
      [id, req.empresaId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Motorista não encontrado.' });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar motorista:', error);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
};

export const atualizarMotorista = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { nome, cnh, telefone } = req.body;

    const result = await pool.query(
      `UPDATE motoristas 
       SET nome = $1, cnh = $2, telefone = $3
       WHERE id = $4 AND empresa_id = $5
       RETURNING *`,
      [nome, cnh, telefone, id, req.empresaId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Motorista não encontrado para atualização.' });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error: any) {
    console.error('Erro ao atualizar motorista:', error);

    if (error.code === '23505') {
      return res.status(409).json({ erro: 'Já existe outro motorista cadastrado com esta CNH.' });
    }

    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
};

export const deletarMotorista = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM motoristas WHERE id = $1 AND empresa_id = $2 RETURNING *',
      [id, req.empresaId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Motorista não encontrado para remoção.' });
    }

    return res.status(200).json({ mensagem: 'Motorista removido com sucesso.' });
  } catch (error) {
    console.error('Erro ao deletar motorista:', error);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
};