import { Response } from 'express';
import { pool } from '../database/db';
import { RequestComUsuario } from '../middlewares/authMiddleware';

export const criarVeiculo = async (req: RequestComUsuario, res: Response) => {
  try {
    const usuario = req.usuario;

    if (!usuario) {
      return res.status(401).json({ erro: 'Utilizador não autenticado.' });
    }

    const { placa, modelo, marca, ano, status } = req.body;

    if (!placa || !modelo) {
      return res.status(400).json({ erro: 'Placa e modelo são obrigatórios.' });
    }

    const query = `
      INSERT INTO veiculos (empresa_id, placa, modelo, marca, ano, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const values = [
      usuario.empresa_id,
      placa,
      modelo,
      marca || null,
      ano || null,
      status || 'DISPONIVEL'
    ];

    const result = await pool.query(query, values);
    return res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error('Erro ao criar veículo:', error);

    if (error.code === '23505') {
      return res.status(400).json({ erro: 'Já existe um veículo cadastrado com esta placa.' });
    }

    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
};

export const listarVeiculos = async (req: RequestComUsuario, res: Response) => {
  try {
    const usuario = req.usuario;

    if (!usuario) {
      return res.status(401).json({ erro: 'Utilizador não autenticado.' });
    }

    const query = `
      SELECT * FROM veiculos 
      WHERE empresa_id = $1 
      ORDER BY created_at DESC
    `;

    const result = await pool.query(query, [usuario.empresa_id]);
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao listar veículos:', error);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
};

export const obterVeiculoPorId = async (req: RequestComUsuario, res: Response) => {
  try {
    const usuario = req.usuario;
    const { id } = req.params;

    if (!usuario) {
      return res.status(401).json({ erro: 'Utilizador não autenticado.' });
    }

    const query = `
      SELECT * FROM veiculos 
      WHERE id = $1 AND empresa_id = $2
    `;

    const result = await pool.query(query, [id, usuario.empresa_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Veículo não encontrado.' });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao obter veículo:', error);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
};

export const atualizarVeiculo = async (req: RequestComUsuario, res: Response) => {
  try {
    const usuario = req.usuario;
    const { id } = req.params;

    if (!usuario) {
      return res.status(401).json({ erro: 'Utilizador não autenticado.' });
    }

    const { placa, modelo, marca, ano, status } = req.body;

    const query = `
      UPDATE veiculos 
      SET 
        placa = COALESCE($1, placa),
        modelo = COALESCE($2, modelo),
        marca = COALESCE($3, marca),
        ano = COALESCE($4, ano),
        status = COALESCE($5, status)
      WHERE id = $6 AND empresa_id = $7
      RETURNING *
    `;

    const values = [placa, modelo, marca, ano, status, id, usuario.empresa_id];
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Veículo não encontrado.' });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error: any) {
    console.error('Erro ao atualizar veículo:', error);

    if (error.code === '23505') {
      return res.status(400).json({ erro: 'Já existe outro veículo com esta placa.' });
    }

    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
};

export const deletarVeiculo = async (req: RequestComUsuario, res: Response) => {
  try {
    const usuario = req.usuario;
    const { id } = req.params;

    if (!usuario) {
      return res.status(401).json({ erro: 'Utilizador não autenticado.' });
    }

    const query = `
      DELETE FROM veiculos 
      WHERE id = $1 AND empresa_id = $2
      RETURNING *
    `;

    const result = await pool.query(query, [id, usuario.empresa_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Veículo não encontrado.' });
    }

    return res.status(200).json({ mensagem: 'Veículo removido com sucesso.' });
  } catch (error) {
    console.error('Erro ao deletar veículo:', error);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
};