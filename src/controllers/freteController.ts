import { Response } from 'express';
import { pool } from '../database/db';
import { RequestComUsuario } from '../middlewares/authMiddleware';

// Regex para validar o formato UUID v4 antes de enviar à query do PostgreSQL
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const criarFrete = async (req: RequestComUsuario, res: Response) => {
  const client = await pool.connect();

  try {
    const usuario = req.usuario;

    if (!usuario) {
      return res.status(401).json({ erro: 'Utilizador não autenticado.' });
    }

    const { cliente, origem, destino, valor, peso_kg, motorista_id, veiculo_id } = req.body;

    // 1. Validação de campos obrigatórios
    if (!cliente || !origem || !destino || !valor) {
      return res.status(400).json({ erro: 'Cliente, origem, destino e valor são obrigatórios.' });
    }

    // 2. Validação preventiva do formato UUID dos IDs
    if (veiculo_id && !uuidRegex.test(veiculo_id)) {
      return res.status(400).json({ erro: 'O veiculo_id fornecido possui um formato UUID inválido.' });
    }

    if (motorista_id && !uuidRegex.test(motorista_id)) {
      return res.status(400).json({ erro: 'O motorista_id fornecido possui um formato UUID inválido.' });
    }

    await client.query('BEGIN');

    // 3. Validar Veículo (se fornecido)
    if (veiculo_id) {
      const veiculoRes = await client.query(
        `SELECT status FROM veiculos WHERE id = $1 AND empresa_id = $2`,
        [veiculo_id, usuario.empresa_id]
      );

      if (veiculoRes.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ erro: 'Veículo não encontrado ou não pertence a esta empresa.' });
      }

      if (veiculoRes.rows[0].status !== 'DISPONIVEL') {
        await client.query('ROLLBACK');
        return res.status(400).json({ erro: 'Veículo selecionado não está disponível.' });
      }
    }

    // 4. Validar Motorista (se fornecido)
    if (motorista_id) {
      const motoristaRes = await client.query(
        `SELECT id FROM motoristas WHERE id = $1 AND empresa_id = $2`,
        [motorista_id, usuario.empresa_id]
      );

      if (motoristaRes.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ erro: 'Motorista não encontrado ou não pertence a esta empresa.' });
      }
    }

    // 5. Gerar Código de Rastreio único
    const codigoRastreio = `TAP-${Math.floor(100000 + Math.random() * 900000)}`;

    // 6. Inserir Registo de Frete
    const queryFrete = `
      INSERT INTO fretes (empresa_id, cliente, origem, destino, valor, peso_kg, motorista_id, veiculo_id, codigo_rastreio, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'EM_ANDAMENTO')
      RETURNING *
    `;

    const valuesFrete = [
      usuario.empresa_id,
      cliente,
      origem,
      destino,
      valor,
      peso_kg || null,
      motorista_id || null,
      veiculo_id || null,
      codigoRastreio
    ];

    const resultFrete = await client.query(queryFrete, valuesFrete);

    // 7. Atualizar Status do Veículo para 'EM_TRANSITO'
    if (veiculo_id) {
      await client.query(
        `UPDATE veiculos SET status = 'EM_TRANSITO' WHERE id = $1 AND empresa_id = $2`,
        [veiculo_id, usuario.empresa_id]
      );
    }

    await client.query('COMMIT');
    return res.status(201).json(resultFrete.rows[0]);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao criar frete:', error);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  } finally {
    client.release();
  }
};

export const listarFretes = async (req: RequestComUsuario, res: Response) => {
  try {
    const usuario = req.usuario;

    if (!usuario) {
      return res.status(401).json({ erro: 'Utilizador não autenticado.' });
    }

    const query = `
      SELECT f.*, 
             v.placa AS veiculo_placa, v.modelo AS veiculo_modelo,
             m.nome AS motorista_nome
      FROM fretes f
      LEFT JOIN veiculos v ON f.veiculo_id = v.id
      LEFT JOIN motoristas m ON f.motorista_id = m.id
      WHERE f.empresa_id = $1
      ORDER BY f.created_at DESC
    `;

    const result = await pool.query(query, [usuario.empresa_id]);
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao listar fretes:', error);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
};