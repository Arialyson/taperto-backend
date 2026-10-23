import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../database/db';
import { RequestComUsuario } from '../middlewares/authMiddleware';

export const login = async (req: Request, res: Response) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ erro: 'E-mail e senha são obrigatórios.' });
  }

  try {
    // 1. Procurar o utilizador pelo e-mail
    const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ erro: 'Credenciais inválidas.' });
    }

    const usuario = result.rows[0];

    // Verificar se o utilizador está ativo
    if (!usuario.ativo) {
      return res.status(403).json({ erro: 'Utilizador inativo no sistema.' });
    }

    // 2. Comparar a senha enviada com a hash guardada no banco
    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      return res.status(401).json({ erro: 'Credenciais inválidas.' });
    }

    // 3. Gerar o Token JWT com os dados de identificação e empresa
    const jwtSecret = process.env.JWT_SECRET || 'secreto_fallback';
    
    const token = jwt.sign(
      {
        id: usuario.id,
        empresa_id: usuario.empresa_id,
        cargo: usuario.cargo,
        nome: usuario.nome
      },
      jwtSecret,
      { expiresIn: '1d' }
    );

    // 4. Retornar os dados e o token
    return res.json({
      mensagem: 'Login realizado com sucesso!',
      token,
      usuario: {
        id: usuario.id,
        empresa_id: usuario.empresa_id,
        nome: usuario.nome,
        email: usuario.email,
        cargo: usuario.cargo
      }
    });

  } catch (error: any) {
    return res.status(500).json({ erro: 'Erro ao realizar login.', detalhe: error.message });
  }
};

// Rota protegida: Retorna os dados do utilizador atualmente autenticado via Token
export const obterPerfil = async (req: RequestComUsuario, res: Response) => {
  return res.json({
    mensagem: 'Acesso autorizado!',
    usuarioAutenticado: req.usuario
  });
};