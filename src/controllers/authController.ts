import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../database/db';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ erro: 'E-mail e senha são obrigatórios.' });
    }

    const result = await pool.query('SELECT * FROM empresas WHERE email = $1', [email]);

    if (result.rowCount === 0) {
      return res.status(401).json({ erro: 'Credenciais inválidas.' });
    }

    const empresa = result.rows[0];
    const senhaBanco = empresa.senha_hash || empresa.senha;

    if (!senhaBanco) {
      return res.status(401).json({ erro: 'Credenciais inválidas.' });
    }

    const senhaValida = await bcrypt.compare(senha, senhaBanco);

    if (!senhaValida) {
      return res.status(401).json({ erro: 'Credenciais inválidas.' });
    }

    const secret = process.env.JWT_SECRET || 'secret_key_padrao';
    const token = jwt.sign(
      {
        id: empresa.id,
        empresa_id: empresa.id,
        email: empresa.email,
        nome: empresa.nome
      },
      secret,
      { expiresIn: '8h' }
    );

    return res.status(200).json({
      token,
      empresa: {
        id: empresa.id,
        nome: empresa.nome,
        email: empresa.email
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
};