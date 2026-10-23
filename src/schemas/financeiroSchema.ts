import { z } from 'zod';

export const criarLancamentoFinanceiroSchema = z.object({
  frete_id: z.string().uuid('ID de frete deve ser um UUID válido'),
  valor_total: z.number().positive('O valor total deve ser positivo'),
  status_pagamento: z.enum(['Pendente', 'Pago', 'Vencido', 'Cancelado']).optional(),
  forma_pagamento: z.string().optional().nullable(),
  data_vencimento: z.string().min(10, 'Data de vencimento é obrigatória (AAAA-MM-DD)'),
  data_pagamento: z.string().optional().nullable()
});

export const atualizarStatusFinanceiroSchema = z.object({
  status_pagamento: z.enum(['Pendente', 'Pago', 'Vencido', 'Cancelado']),
  forma_pagamento: z.string().optional().nullable(),
  data_pagamento: z.string().optional().nullable()
});