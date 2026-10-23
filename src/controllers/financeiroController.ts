import { Response } from 'express';
import { pool } from '../database/db';

export const criarLancamentoFinanceiro = async (req: any, res: Response) => {
  try {
    const empresa_id = req.usuario?.empresa_id;
    const { frete_id, valor_total, status_pagamento, forma_pagamento, data_vencimento, data_pagamento } = req.body;

    if (!empresa_id) {
      res.status(400).json({ erro: 'Empresa não identificada.' });
      return;
    }

    const freteResult = await pool.query(
      'SELECT id FROM fretes WHERE id = $1 AND empresa_id = $2',
      [frete_id, empresa_id]
    );

    if (freteResult.rowCount === 0) {
      res.status(404).json({ erro: 'Frete não encontrado ou não pertence a esta empresa.' });
      return;
    }

    const insertQuery = `
      INSERT INTO financeiro_fretes 
      (empresa_id, frete_id, valor_total, status_pagamento, forma_pagamento, data_vencimento, data_pagamento) 
      VALUES ($1, $2, $3, $4, $5, $6, $7) 
      RETURNING *
    `;
    
    const values = [
      empresa_id, frete_id, valor_total,
      status_pagamento || 'Pendente',
      forma_pagamento || null,
      data_vencimento,
      data_pagamento || null
    ];

    const { rows } = await pool.query(insertQuery, values);
    res.status(201).json(rows[0]);
    return;
  } catch (error: any) {
    if (error.code === '23505') {
      res.status(400).json({ erro: 'Já existe um lançamento financeiro para este frete.' });
      return;
    }
    res.status(500).json({ erro: 'Erro interno no servidor.' });
    return;
  }
};

export const listarFinanceiro = async (req: any, res: Response) => {
  try {
    const empresa_id = req.usuario?.empresa_id;
    const { status_pagamento, pagina = 1, limite = 10 } = req.query;

    if (!empresa_id) {
      res.status(400).json({ erro: 'Empresa não identificada.' });
      return;
    }

    const pageNum = Number(pagina);
    const limitNum = Number(limite);
    const offset = (pageNum - 1) * limitNum;
    
    let queryStr = `
      SELECT ff.*, 
             json_build_object(
               'codigo_rastreio', f.codigo_rastreio,
               'origem_cidade_uf', f.origem_cidade_uf,
               'destino_cidade_uf', f.destino_cidade_uf
             ) as fretes
      FROM financeiro_fretes ff
      LEFT JOIN fretes f ON ff.frete_id = f.id
      WHERE ff.empresa_id = $1
    `;
    const queryParams: any[] = [empresa_id];
    let paramIndex = 2;

    if (status_pagamento) {
      queryStr += ` AND ff.status_pagamento = $${paramIndex}`;
      queryParams.push(String(status_pagamento));
      paramIndex++;
    }

    const countQueryStr = `SELECT COUNT(*) FROM (${queryStr}) as total`;
    const countResult = await pool.query(countQueryStr, queryParams);
    const totalRegistros = parseInt(countResult.rows[0].count);

    queryStr += ` ORDER BY ff.data_vencimento ASC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(limitNum, offset);

    const { rows } = await pool.query(queryStr, queryParams);

    res.status(200).json({
      dados: rows,
      paginacao: {
        pagina: pageNum,
        limite: limitNum,
        total_registros: totalRegistros,
        total_paginas: Math.ceil(totalRegistros / limitNum)
      }
    });
    return;
  } catch (error) {
    res.status(500).json({ erro: 'Erro interno no servidor.' });
    return;
  }
};

export const atualizarStatusFinanceiro = async (req: any, res: Response) => {
  try {
    const empresa_id = req.usuario?.empresa_id;
    const { id } = req.params;
    const { status_pagamento, forma_pagamento, data_pagamento } = req.body;

    if (!empresa_id) {
      res.status(400).json({ erro: 'Empresa não identificada.' });
      return;
    }

    const dataPag = status_pagamento === 'Pago' ? (data_pagamento || new Date().toISOString().split('T')[0]) : null;

    const updateQuery = `
      UPDATE financeiro_fretes 
      SET status_pagamento = $1, 
          forma_pagamento = COALESCE($2, forma_pagamento), 
          data_pagamento = $3, 
          updated_at = NOW() 
      WHERE id = $4 AND empresa_id = $5 
      RETURNING *
    `;

    const values = [status_pagamento, forma_pagamento || null, dataPag, id, empresa_id];
    const result = await pool.query(updateQuery, values);

    if (result.rowCount === 0 || result.rowCount === null) {
      res.status(404).json({ erro: 'Lançamento financeiro não encontrado.' });
      return;
    }

    res.status(200).json(result.rows[0]);
    return;
  } catch (error) {
    res.status(500).json({ erro: 'Erro interno no servidor.' });
    return;
  }
};