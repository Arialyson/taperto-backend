import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  empresaId?: string;
}

export const autenticarToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extrai o token após "Bearer "

  if (!token) {
    return res.status(401).json({ erro: 'Acesso negado. Token não fornecido.' });
  }

  try {
    const secret = process.env.JWT_SECRET || 'secret_key_padrao';
    const decoded = jwt.verify(token, secret) as { id: string; empresa_id: string };

    req.empresaId = decoded.empresa_id || decoded.id;
    return next();
  } catch (error) {
    return res.status(403).json({ erro: 'Token inválido ou expirado.' });
  }
};