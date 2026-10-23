import { Response } from 'express';
import supabase from '../database/db';

export const criarLancamentoFinanceiro = async (req: any, res: Response) => {
  try {
    const empresa_id = req.usuario?.empresa_id;
    const { frete_id, valor_total, status_pagamento, forma_pagamento, data_vencimento, data_pagamento } = req.body;

    if (!empresa_id) {
      res.status(400).json({ erro: 'Empresa não identificada.' });
      return;
    }

    const { data: freteExiste, error: errFrete } = await supabase
      .from('fretes')
      .select('id')
      .eq('id', frete_id)
      .eq('empresa_id', empresa_id)
      .single();

    if (errFrete || !freteExiste) {
      res.status(404).json({ erro: 'Frete não encontrado ou não pertence a esta empresa.' });
      return;
    }

    const { data, error } = await supabase
      .from('financeiro_fretes')
      .insert([
        {
          empresa_id,
          frete_id,
          valor_total,
          status_pagamento: status_pagamento || 'Pendente',
          forma_pagamento: forma_pagamento || null,
          data_vencimento,
          data_pagamento: data_pagamento || null
        }
      ])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        res.status(400).json({ erro: 'Já existe um lançamento financeiro para este frete.' });
        return;
      }
      res.status(500).json({ erro: error.message });
      return;
    }

    res.status(201).json(data);
    return;
  } catch (error) {
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
    const inicio = (pageNum - 1) * limitNum;
    const fim = inicio + limitNum - 1;

    let query = supabase
      .from('financeiro_fretes')
      .select('*, fretes(codigo_rastreio, origem_cidade_uf, destino_cidade_uf)', { count: 'exact' })
      .eq('empresa_id', empresa_id);

    if (status_pagamento) {
      query = query.eq('status_pagamento', String(status_pagamento));
    }

    const { data, error, count } = await query
      .order('data_vencimento', { ascending: true })
      .range(inicio, fim);

    if (error) {
      res.status(500).json({ erro: error.message });
      return;
    }

    res.status(200).json({
      dados: data,
      paginacao: {
        pagina: pageNum,
        limite: limitNum,
        total_registros: count,
        total_paginas: count ? Math.ceil(count / limitNum) : 0
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

    const { data, error } = await supabase
      .from('financeiro_fretes')
      .update({
        status_pagamento,
        forma_pagamento: forma_pagamento || null,
        data_pagamento: status_pagamento === 'Pago' ? (data_pagamento || new Date().toISOString().split('T')[0]) : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('empresa_id', empresa_id)
      .select()
      .single();

    if (error || !data) {
      res.status(404).json({ erro: 'Lançamento financeiro não encontrado.' });
      return;
    }

    res.status(200).json(data);
    return;
  } catch (error) {
    res.status(500).json({ erro: 'Erro interno no servidor.' });
    return;
  }
};