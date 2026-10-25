import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../database/db';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, senha } = req.body;

    console.log('🔍 [DEBUG LOGIN] E-mail buscado:', email);

    const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    console.log('🔍 [DEBUG LOGIN] Registos encontrados:', result.rowCount);

    if (result.rowCount === 0) {
      return res.status(401).json({ erro: 'Credenciais inválidas.' });
    }

    const usuario = result.rows[0];
    console.log('🔍 [DEBUG LOGIN] Senha no banco:', usuario.senha);

    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    console.log('🔍 [DEBUG LOGIN] Senha válida?:', senhaValida);

    if (!senhaValida) {
      return res.status(401).json({ erro: 'Credenciais inválidas.' });
    }

    const secret = process.env.JWT_SECRET || 'secret_key_padrao';
    const token = jwt.sign(
      {
        id: usuario.id,
        empresa_id: usuario.empresa_id,
        email: usuario.email,
        cargo: usuario.cargo,
        role: usuario.role
      },
      secret,
      { expiresIn: '8h' }
    );

    return res.status(200).json({
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        empresa_id: usuario.empresa_id
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
};