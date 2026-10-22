import { Request, Response } from 'express';
import { pool } from '../database/db';

// Criar uma nova empresa (Tenant)
export const criarEmpresa = async (req: Request, res: Response) => {
  const { nome, cnpj, telefone, email, logo_url, plano } = req.body;

  if (!nome || !cnpj || !email) {
    return res.status(400).json({ erro: 'Nome, CNPJ e e-mail são obrigatórios.' });
  }

  try {
    const query = `
      INSERT INTO empresas (nome, cnpj, telefone, email, logo_url, plano)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const values = [nome, cnpj, telefone, email, logo_url, plano || 'GRATUITO'];
    const result = await pool.query(query, values);

    return res.status(201).json(result.rows[0]);
  } catch (error: any) {
    if (error.code === '23505') {
      return res.status(400).json({ erro: 'Este CNPJ já está registado.' });
    }
    return res.status(500).json({ erro: 'Erro ao criar empresa.', detalhe: error.message });
  }
};

// Listar todas as empresas
export const listarEmpresas = async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM empresas ORDER BY created_at DESC');
    return res.json(result.rows);
  } catch (error: any) {
    return res.status(500).json({ erro: 'Erro ao listar empresas.', detalhe: error.message });
  }
};

// Obter uma empresa pelo ID
export const obterEmpresaPorId = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const result = await pool.query('SELECT * FROM empresas WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Empresa não encontrada.' });
    }

    return res.json(result.rows[0]);
  } catch (error: any) {
    return res.status(500).json({ erro: 'Erro ao procurar empresa.', detalhe: error.message });
  }
};

// Atualizar os dados de uma empresa
export const atualizarEmpresa = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { nome, cnpj, telefone, email, logo_url, plano } = req.body;

  try {
    const query = `
      UPDATE empresas
      SET nome = COALESCE($1, nome),
          cnpj = COALESCE($2, cnpj),
          telefone = COALESCE($3, telefone),
          email = COALESCE($4, email),
          logo_url = COALESCE($5, logo_url),
          plano = COALESCE($6, plano)
      WHERE id = $7
      RETURNING *;
    `;
    const values = [nome, cnpj, telefone, email, logo_url, plano, id];
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Empresa não encontrada.' });
    }

    return res.json(result.rows[0]);
  } catch (error: any) {
    return res.status(500).json({ erro: 'Erro ao atualizar empresa.', detalhe: error.message });
  }
};

// Eliminar uma empresa
export const deletarEmpresa = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM empresas WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Empresa não encontrada.' });
    }

    return res.json({ mensagem: 'Empresa eliminada com sucesso.' });
  } catch (error: any) {
    return res.status(500).json({ erro: 'Erro ao eliminar empresa.', detalhe: error.message });
  }
};