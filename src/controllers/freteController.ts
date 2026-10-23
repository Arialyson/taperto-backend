import { Request, Response } from 'express';
import { pool } from '../database/db';
import { RequestComUsuario } from '../middlewares/authMiddleware';

// Gerar código de rastreio único (ex: TP-8F3A29)
const gerarCodigoRastreio = (): string => {
  const hash = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `TP-${hash}`;
};

// Criar um novo frete
export const criarFrete = async (req: RequestComUsuario, res: Response) => {
  const { 
    motorista_id, 
    veiculo_id, 
    cliente_id, 
    origem_cidade_uf, 
    destino_cidade_uf, 
    nota_fiscal, 
    valor_frete 
  } = req.body;

  const empresa_id = req.usuario?.empresa_id;

  if (!empresa_id) {
    return res.status(401).json({ erro: 'Utilizador não autenticado ou sem empresa vinculada.' });
  }

  if (!origem_cidade_uf || !destino_cidade_uf || !valor_frete) {
    return res.status(400).json({ erro: 'Origem, destino e valor do frete são obrigatórios.' });
  }

  try {
    const codigo_rastreio = gerarCodigoRastreio();

    const query = `
      INSERT INTO fretes (
        empresa_id, motorista_id, veiculo_id, cliente_id, codigo_rastreio,
        origem_cidade_uf, destino_cidade_uf, nota_fiscal, valor_frete
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *;
    `;

    const values = [
      empresa_id,
      motorista_id || null,
      veiculo_id || null,
      cliente_id || null,
      codigo_rastreio,
      origem_cidade_uf,
      destino_cidade_uf,
      nota_fiscal || null,
      valor_frete
    ];

    const result = await pool.query(query, values);
    const novoFrete = result.rows[0];

    // Registar evento inicial no histórico
    await pool.query(
      `INSERT INTO historico_fretes (frete_id, status, descricao) VALUES ($1, $2, $3)`,
      [novoFrete.id, novoFrete.status || 'Aguardando Coleta', 'Frete registado no sistema.']
    );

    return res.status(201).json(novoFrete);
  } catch (error: any) {
    return res.status(500).json({ erro: 'Erro ao criar frete.', detalhe: error.message });
  }
};

// Listar fretes da empresa com filtros dinâmicos e paginação
export const listarFretes = async (req: RequestComUsuario, res: Response) => {
  const empresa_id = req.usuario?.empresa_id;

  if (!empresa_id) {
    return res.status(401).json({ erro: 'Utilizador não autenticado.' });
  }

  const { status, cliente_id, pagina = 1, limite = 10 } = req.query;

  try {
    let query = `
      SELECT 
        f.*,
        m.nome AS nome_motorista,
        v.placa AS placa_veiculo,
        v.modelo AS modelo_veiculo,
        c.nome_razasocial AS cliente_nome
      FROM fretes f
      LEFT JOIN motoristas m ON f.motorista_id = m.id
      LEFT JOIN veiculos v ON f.veiculo_id = v.id
      LEFT JOIN clientes c ON f.cliente_id = c.id
      WHERE f.empresa_id = $1
    `;

    const values: any[] = [empresa_id];
    let paramIndex = 2;

    // Filtro por status
    if (status) {
      query += ` AND f.status = $${paramIndex}`;
      values.push(status);
      paramIndex++;
    }

    // Filtro por cliente
    if (cliente_id) {
      query += ` AND f.cliente_id = $${paramIndex}`;
      values.push(cliente_id);
      paramIndex++;
    }

    // Paginação
    const limitNum = parseInt(limite as string, 10) || 10;
    const pageNum = parseInt(pagina as string, 10) || 1;
    const offset = (pageNum - 1) * limitNum;

    query += ` ORDER BY f.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    values.push(limitNum, offset);

    const result = await pool.query(query, values);

    return res.json({
      pagina: pageNum,
      limite: limitNum,
      total_retornado: result.rows.length,
      dados: result.rows
    });
  } catch (error: any) {
    return res.status(500).json({ erro: 'Erro ao listar fretes.', detalhe: error.message });
  }
};

// Atualizar o status de um frete e registar no histórico
export const atualizarStatusFrete = async (req: RequestComUsuario, res: Response) => {
  const { id } = req.params;
  const { status, descricao, localizacao } = req.body;
  const empresa_id = req.usuario?.empresa_id;

  if (!empresa_id) {
    return res.status(401).json({ erro: 'Utilizador não autenticado.' });
  }

  if (!status) {
    return res.status(400).json({ erro: 'O novo status é obrigatório.' });
  }

  try {
    const query = `
      UPDATE fretes
      SET status = $1
      WHERE id = $2 AND empresa_id = $3
      RETURNING *;
    `;

    const result = await pool.query(query, [status, id, empresa_id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ erro: 'Frete não encontrado ou sem permissão para alterar.' });
    }

    // Registar evento no histórico
    await pool.query(
      `INSERT INTO historico_fretes (frete_id, status, descricao, localizacao) VALUES ($1, $2, $3, $4)`,
      [id, status, descricao || null, localizacao || null]
    );

    return res.json(result.rows[0]);
  } catch (error: any) {
    return res.status(500).json({ erro: 'Erro ao atualizar status do frete.', detalhe: error.message });
  }
};

// Rastreio Público do Frete com Linha do Tempo (Sem Token)
export const rastrearFretePublico = async (req: Request, res: Response) => {
  const { codigo } = req.params;

  if (!codigo) {
    return res.status(400).json({ erro: 'Código de rastreio não fornecido.' });
  }

  try {
    const queryFrete = `
      SELECT 
        id,
        codigo_rastreio,
        origem_cidade_uf,
        destino_cidade_uf,
        status,
        created_at
      FROM fretes
      WHERE codigo_rastreio = $1;
    `;

    const resultFrete = await pool.query(queryFrete, [(codigo as string).toUpperCase()]);

    if (resultFrete.rows.length === 0) {
      return res.status(404).json({ erro: 'Código de rastreio inválido ou não encontrado.' });
    }

    const frete = resultFrete.rows[0];

    // Buscar histórico de eventos em ordem cronológica
    const queryHistorico = `
      SELECT status, descricao, localizacao, created_at
      FROM historico_fretes
      WHERE frete_id = $1
      ORDER BY created_at ASC;
    `;

    const resultHistorico = await pool.query(queryHistorico, [frete.id]);

    return res.json({
      ...frete,
      historico: resultHistorico.rows
    });
  } catch (error: any) {
    return res.status(500).json({ erro: 'Erro ao consultar rastreio.', detalhe: error.message });
  }
};