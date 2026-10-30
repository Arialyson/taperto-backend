import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { pool } from '../database/db';

export const listarVeiculos = async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT * FROM veiculos WHERE empresa_id = $1',
      [req.empresaId]
    );
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao listar veículos:', error);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
};

export const criarVeiculo = async (req: AuthRequest, res: Response) => {
  try {
    const { placa, modelo, marca, ano, capacidade_kg } = req.body;

    const result = await pool.query(
      `INSERT INTO veiculos (empresa_id, placa, modelo, marca, ano, capacidade_kg)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [req.empresaId, placa, modelo, marca, ano, capacidade_kg]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error('Erro ao criar veículo:', error);

    if (error.code === '23505') {
      return res.status(409).json({ erro: 'Já existe um veículo cadastrado com esta placa.' });
    }

    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
};

export const obterVeiculoPorId = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM veiculos WHERE id = $1 AND empresa_id = $2',
      [id, req.empresaId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Veículo não encontrado.' });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar veículo:', error);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
};

export const atualizarVeiculo = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { placa, modelo, marca, ano, capacidade_kg } = req.body;

    const result = await pool.query(
      `UPDATE veiculos 
       SET placa = $1, modelo = $2, marca = $3, ano = $4, capacidade_kg = $5
       WHERE id = $6 AND empresa_id = $7
       RETURNING *`,
      [placa, modelo, marca, ano, capacidade_kg, id, req.empresaId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Veículo não encontrado para atualização.' });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error: any) {
    console.error('Erro ao atualizar veículo:', error);

    if (error.code === '23505') {
      return res.status(409).json({ erro: 'Já existe outro veículo com esta placa.' });
    }

    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
};

export const deletarVeiculo = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM veiculos WHERE id = $1 AND empresa_id = $2 RETURNING *',
      [id, req.empresaId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Veículo não encontrado para remoção.' });
    }

    return res.status(200).json({ mensagem: 'Veículo removido com sucesso.' });
  } catch (error) {
    console.error('Erro ao deletar veículo:', error);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
};