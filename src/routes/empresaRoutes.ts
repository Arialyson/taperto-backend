import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../database/db';

// 1. Criar Empresa
export const criarEmpresa = async (req: Request, res: Response) => {
  try {
    const { nome, cnpj, email, senha } = req.body;

    if (!nome || !cnpj || !email || !senha) {
      return res.status(400).json({ erro: 'Nome, CNPJ, e-mail e senha são obrigatórios.' });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    // Inserção na tabela empresas
    const result = await pool.query(
      `INSERT INTO empresas (nome, cnpj, email, senha_hash) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, nome, cnpj, email`,
      [nome, cnpj, email, senhaHash]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error: any) {
    if (error.code === '23505') {
      return res.status(400).json({ erro: 'Este CNPJ ou e-mail já está registado.' });
    }
    console.error('Erro ao criar empresa:', error);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
};

// 2. Listar Empresas
export const listarEmpresas = async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT id, nome, cnpj, email FROM empresas');
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao listar empresas:', error);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
};

// 3. Obter Empresa por ID
export const obterEmpresaPorId = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT id, nome, cnpj, email FROM empresas WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ erro: 'Empresa não encontrada.' });
    }
    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao obter empresa:', error);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
};

// 4. Atualizar Empresa
export const atualizarEmpresa = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nome, cnpj, email } = req.body;
    const result = await pool.query(
      'UPDATE empresas SET nome = $1, cnpj = $2, email = $3 WHERE id = $4 RETURNING id, nome, cnpj, email',
      [nome, cnpj, email, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ erro: 'Empresa não encontrada.' });
    }
    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar empresa:', error);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
};

// 5. Deletar Empresa
export const deletarEmpresa = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM empresas WHERE id = $1 RETURNING id', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ erro: 'Empresa não encontrada.' });
    }
    return res.status(200).json({ mensagem: 'Empresa removida com sucesso.' });
  } catch (error) {
    console.error('Erro ao deletar empresa:', error);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
};