import { Request, Response, NextFunction } from 'express';
import { ZodTypeAny, ZodError, ZodIssue } from 'zod';

export const validarBody = (schema: ZodTypeAny) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          erro: 'Dados de entrada inválidos.',
          detalhes: error.issues.map((e: ZodIssue) => ({
            campo: e.path.join('.'),
            mensagem: e.message,
          })),
        });
      }
      return res.status(500).json({ erro: 'Erro interno na validação de dados.' });
    }
  };
};