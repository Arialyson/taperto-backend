import { z } from 'zod';

export const criarFreteSchema = z.object({
  motorista_id: z.string().uuid('ID de motorista deve ser um UUID válido').optional().nullable(),
  veiculo_id: z.string().uuid('ID de veículo deve ser um UUID válido').optional().nullable(),
  cliente_id: z.string().uuid('ID de cliente deve ser um UUID válido').optional().nullable(),
  origem_cidade_uf: z.string().min(3, 'Origem é obrigatória (mínimo 3 caracteres)'),
  destino_cidade_uf: z.string().min(3, 'Destino é obrigatório (mínimo 3 caracteres)'),
  nota_fiscal: z.string().optional().nullable(),
  valor_frete: z.number().positive('O valor do frete deve ser maior que zero')
});

export const atualizarStatusSchema = z.object({
  status: z.string().min(2, 'O novo status é obrigatório'),
  descricao: z.string().optional().nullable(),
  localizacao: z.string().optional().nullable()
});