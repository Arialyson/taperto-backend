import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../database/db';

// Criar um novo utilizador vinculado a uma empresa (com senha criptografada)
export const criarUsuario = async (req: Request, res: Response) => {
  const { empresa_id, nome, email, senha, cargo } = req.body;

  if (!empresa_id || !nome || !email || !senha) {
    return res.status(400).json({ erro: 'empresa_id, nome, email e senha são obrigatórios.' });
  }

  try {
    // 1. Gerar a hash da senha usando bcrypt (10 rodadas de salt)
    const saltRounds = 10;
    const senhaHash = await bcrypt.hash(senha, saltRounds);

    // 2. Salvar no banco usando a senhaHash em vez da senha em texto puro
    const query = `
      INSERT INTO usuarios (empresa_id, nome, email, senha, cargo)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, empresa_id, nome, email, cargo, ativo, created_at;
    `;
    const values = [empresa_id, nome, email, senhaHash, cargo || 'OPERADOR'];
    const result = await pool.query(query, values);

    return res.status(201).json(result.rows[0]);
  } catch (error: any) {
    if (error.code === '23505') {
      return res.status(400).json({ erro: 'Este e-mail já está registado.' });
    }
    if (error.code === '23503') {
      return res.status(404).json({ erro: 'Empresa informada não existe.' });
    }
    return res.status(500).json({ erro: 'Erro ao criar utilizador.', detalhe: error.message });
  }
};

// Listar todos os utilizadores de uma empresa específica
export const listarUsuariosPorEmpresa = async (req: Request, res: Response) => {
  const { empresa_id } = req.params;

  try {
    const query = `
      SELECT id, empresa_id, nome, email, cargo, ativo, created_at
      FROM usuarios
      WHERE empresa_id = $1
      ORDER BY created_at DESC;
    `;
    const result = await pool.query(query, [empresa_id]);
    return res.json(result.rows);
  } catch (error: any) {
    return res.status(500).json({ erro: 'Erro ao listar utilizadores.', detalhe: error.message });
  }
};