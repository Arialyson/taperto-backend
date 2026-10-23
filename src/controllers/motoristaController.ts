import { Response } from 'express';
import { pool } from '../database/db';
import { RequestComUsuario } from '../middlewares/authMiddleware';

// Criar um novo motorista vinculado à empresa do utilizador autenticado
export const criarMotorista = async (req: RequestComUsuario, res: Response) => {
  const { nome, cpf, cnh, telefone } = req.body;
  const empresa_id = req.usuario?.empresa_id;

  if (!empresa_id) {
    return res.status(401).json({ erro: 'Utilizador não autenticado ou sem empresa vinculada.' });
  }

  if (!nome || !cnh) {
    return res.status(400).json({ erro: 'Nome e CNH são obrigatórios.' });
  }

  try {
    const query = `
      INSERT INTO motoristas (empresa_id, nome, cpf, cnh, telefone)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const values = [empresa_id, nome, cpf || null, cnh, telefone || null];

    const result = await pool.query(query, values);

    return res.status(201).json(result.rows[0]);
  } catch (error: any) {
    if (error.code === '23505') {
      return res.status(400).json({ erro: 'Já existe um motorista registado com este CPF ou CNH.' });
    }
    return res.status(500).json({ erro: 'Erro ao registar motorista.', detalhe: error.message });
  }
};

// Listar todos os motoristas pertencentes à empresa do utilizador autenticado
export const listarMotoristas = async (req: RequestComUsuario, res: Response) => {
  const empresa_id = req.usuario?.empresa_id;

  if (!empresa_id) {
    return res.status(401).json({ erro: 'Utilizador não autenticado.' });
  }

  try {
    const query = `
      SELECT * FROM motoristas
      WHERE empresa_id = $1
      ORDER BY created_at DESC;
    `;
    const result = await pool.query(query, [empresa_id]);

    return res.json(result.rows);
  } catch (error: any) {
    return res.status(500).json({ erro: 'Erro ao listar motoristas.', detalhe: error.message });
  }
};