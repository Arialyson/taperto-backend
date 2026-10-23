import { Response } from 'express';
import { pool } from '../database/db';
import { RequestComUsuario } from '../middlewares/authMiddleware';

// Criar um novo cliente (remetente ou destinatário)
export const criarCliente = async (req: RequestComUsuario, res: Response) => {
  const { nome_razasocial, cpf_cnpj, telefone, email, cidade_uf } = req.body;
  const empresa_id = req.usuario?.empresa_id;

  if (!empresa_id) {
    return res.status(401).json({ erro: 'Utilizador não autenticado.' });
  }

  if (!nome_razasocial || !cpf_cnpj) {
    return res.status(400).json({ erro: 'Nome/Razão Social e CPF/CNPJ são obrigatórios.' });
  }

  try {
    const query = `
      INSERT INTO clientes (empresa_id, nome_razasocial, cpf_cnpj, telefone, email, cidade_uf)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;

    const values = [
      empresa_id,
      nome_razasocial,
      cpf_cnpj,
      telefone || null,
      email || null,
      cidade_uf || null
    ];

    const result = await pool.query(query, values);

    return res.status(201).json(result.rows[0]);
  } catch (error: any) {
    return res.status(500).json({ erro: 'Erro ao cadastrar cliente.', detalhe: error.message });
  }
};

// Listar todos os clientes da empresa
export const listarClientes = async (req: RequestComUsuario, res: Response) => {
  const empresa_id = req.usuario?.empresa_id;

  if (!empresa_id) {
    return res.status(401).json({ erro: 'Utilizador não autenticado.' });
  }

  try {
    const query = `
      SELECT * FROM clientes
      WHERE empresa_id = $1
      ORDER BY created_at DESC;
    `;

    const result = await pool.query(query, [empresa_id]);

    return res.json(result.rows);
  } catch (error: any) {
    return res.status(500).json({ erro: 'Erro ao listar clientes.', detalhe: error.message });
  }
};