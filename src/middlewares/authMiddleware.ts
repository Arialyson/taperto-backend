import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Interface para definir a estrutura do payload guardado no JWT
export interface UsuarioPayload {
  id: string;
  empresa_id: string;
  cargo: string;
  nome: string;
}

// Extensão do tipo Request do Express para incluir o utilizador autenticado
export interface RequestComUsuario extends Request {
  usuario?: UsuarioPayload;
}

export const autenticarToken = (
  req: RequestComUsuario,
  res: Response,
  next: NextFunction
) => {
  // O token vem no cabeçalho Authorization no formato "Bearer TOKEN"
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ erro: 'Acesso negado. Token não fornecido.' });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET || 'secreto_fallback';
    const decoded = jwt.verify(token, jwtSecret) as UsuarioPayload;

    // Anexa os dados do utilizador autenticado no objeto da requisição
    req.usuario = decoded;

    // Autoriza a requisição a prosseguir para a rota/controlador
    return next();
  } catch (error) {
    return res.status(403).json({ erro: 'Token inválido ou expirado.' });
  }
};