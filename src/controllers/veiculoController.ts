import { Response } from 'express';
import { pool } from '../database/db';
import { RequestComUsuario } from '../middlewares/authMiddleware';

// Criar um novo veículo para a empresa do utilizador autenticado
export const criarVeiculo = async (req: RequestComUsuario, res: Response) => {
  const { placa, modelo, marca, ano, capacidade_kg } = req.body;
  const empresa_id = req.usuario?.empresa_id;

  if (!empresa_id) {
    return res.status(401).json({ erro: 'Utilizador não autenticado ou sem empresa vinculada.' });
  }

  if (!placa || !modelo || !marca) {
    return res.status(400).json({ erro: 'Placa, modelo e marca são obrigatórios.' });
  }

  try {
    const query = `
      INSERT INTO veiculos (empresa_id, placa, modelo, marca, ano, capacidade_kg)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const values = [
      empresa_id, 
      placa.toUpperCase(), 
      modelo, 
      marca, 
      ano || null, 
      capacidade_kg || null
    ];
    
    const result = await pool.query(query, values);

    return res.status(201).json(result.rows[0]);
  } catch (error: any) {
    if (error.code === '23505') {
      return res.status(400).json({ erro: 'Já existe um veículo registado com esta placa.' });
    }
    return res.status(500).json({ erro: 'Erro ao registar veículo.', detalhe: error.message });
  }
};

// Listar todos os veículos pertencentes à empresa do utilizador autenticado
export const listarVeiculos = async (req: RequestComUsuario, res: Response) => {
  const empresa_id = req.usuario?.empresa_id;

  if (!empresa_id) {
    return res.status(401).json({ erro: 'Utilizador não autenticado.' });
  }

  try {
    const query = `
      SELECT * FROM veiculos
      WHERE empresa_id = $1
      ORDER BY created_at DESC;
    `;
    const result = await pool.query(query, [empresa_id]);

    return res.json(result.rows);
  } catch (error: any) {
    return res.status(500).json({ erro: 'Erro ao listar veículos.', detalhe: error.message });
  }
};