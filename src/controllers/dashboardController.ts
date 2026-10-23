import { Response } from 'express';
import { pool } from '../database/db';
import { RequestComUsuario } from '../middlewares/authMiddleware';

export const obterResumoDashboard = async (req: RequestComUsuario, res: Response) => {
  const empresa_id = req.usuario?.empresa_id;

  if (!empresa_id) {
    return res.status(401).json({ erro: 'Utilizador não autenticado.' });
  }

  try {
    // Consulta de métricas de fretes
    const fretesQuery = `
      SELECT 
        COUNT(*) FILTER (WHERE status != 'Entregue') AS fretes_em_andamento,
        COUNT(*) FILTER (WHERE status = 'Entregue') AS fretes_concluidos,
        COALESCE(SUM(valor_frete), 0) AS faturamento_total
      FROM fretes
      WHERE empresa_id = $1;
    `;

    // Consulta de veículos
    const veiculosQuery = `
      SELECT COUNT(*) AS total_veiculos 
      FROM veiculos 
      WHERE empresa_id = $1;
    `;

    // Consulta de motoristas
    const motoristasQuery = `
      SELECT COUNT(*) AS total_motoristas 
      FROM motoristas 
      WHERE empresa_id = $1;
    `;

    // Executa as 3 consultas em paralelo
    const [fretesRes, veiculosRes, motoristasRes] = await Promise.all([
      pool.query(fretesQuery, [empresa_id]),
      pool.query(veiculosQuery, [empresa_id]),
      pool.query(motoristasQuery, [empresa_id]),
    ]);

    return res.json({
      fretes: {
        em_andamento: parseInt(fretesRes.rows[0].fretes_em_andamento, 10),
        concluidos: parseInt(fretesRes.rows[0].fretes_concluidos, 10),
        faturamento_total: parseFloat(fretesRes.rows[0].faturamento_total)
      },
      veiculos: {
        total: parseInt(veiculosRes.rows[0].total_veiculos, 10)
      },
      motoristas: {
        total: parseInt(motoristasRes.rows[0].total_motoristas, 10)
      }
    });
  } catch (error: any) {
    return res.status(500).json({ erro: 'Erro ao carregar indicadores do dashboard.', detalhe: error.message });
  }
};