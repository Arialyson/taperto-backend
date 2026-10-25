import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface TokenPayload {
  id: string;
  empresa_id: string;
  email: string;
  cargo?: string;
  role?: string;
}

export interface RequestComUsuario extends Request {
  usuario?: TokenPayload;
}

export const autenticar = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ erro: 'Token não fornecido.' });
  }

  const token = authHeader.replace(/^Bearer\s+/i, '').replace(/^"|"$/g, '').trim();

  try {
    const secret = process.env.JWT_SECRET || 'secret_key_padrao';
    const decoded = jwt.verify(token, secret) as TokenPayload;

    (req as RequestComUsuario).usuario = decoded;
    return next();
  } catch (error: any) {
    return res.status(403).json({ erro: 'Token inválido ou expirado.' });
  }
};