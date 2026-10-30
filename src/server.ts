import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use(cors());

const JWT_SECRET = 'sua_chave_secreta_super_segura_taperto';

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token não fornecido.' });
  }

  const [, token] = authHeader.split(' ');

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    req.userId = decoded.id;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
}

// --- ROTA DE ESTATÍSTICAS DO DASHBOARD ---

app.get('/api/dashboard/stats', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const userId = String(req.userId);

  const [totalFretes, totalMotoristas, totalVeiculos, fretes] = await Promise.all([
    prisma.frete.count({ where: { userId } }),
    prisma.motorista.count({ where: { userId } }),
    prisma.veiculo.count({ where: { userId } }),
    prisma.frete.findMany({ where: { userId } })
  ]);

  const faturamentoTotal = fretes.reduce((acc, f) => acc + f.valor, 0);
  const fretesEmTransito = fretes.filter(f => f.status === 'Em Trânsito').length;
  const fretesEntregues = fretes.filter(f => f.status === 'Entregue').length;
  const fretesPendentes = fretes.filter(f => f.status === 'Pendente').length;

  return res.json({
    totalFretes,
    totalMotoristas,
    totalVeiculos,
    faturamentoTotal,
    fretesEmTransito,
    fretesEntregues,
    fretesPendentes,
    ultimosFretes: fretes.slice(-5).reverse()
  });
});

// --- ROTA PÚBLICA DE RASTREIO ---

app.get('/api/rastreio/:codigo', async (req: Request, res: Response) => {
  const codigoParam = String(req.params.codigo);

  const frete = await prisma.frete.findFirst({
    where: { codigo: codigoParam.toUpperCase() },
    select: {
      codigo: true,
      origem: true,
      destino: true,
      status: true,
      dataCriacao: true,
      user: {
        select: {
          empresa: true
        }
      }
    }
  });

  if (!frete) {
    return res.status(404).json({ error: 'Frete não encontrado. Verifique o código digitado.' });
  }

  return res.json(frete);
});

// --- ROTAS DE AUTENTICAÇÃO ---

app.post('/api/auth/register', async (req: Request, res: Response) => {
  const { nome, empresa, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ error: 'Preencha todos os campos obrigatórios.' });
  }

  const userExists = await prisma.user.findUnique({ where: { email: String(email) } });
  if (userExists) {
    return res.status(400).json({ error: 'Este e-mail já está em uso.' });
  }

  const senhaHash = await bcrypt.hash(String(senha), 8);

  const newUser = await prisma.user.create({
    data: {
      nome: String(nome),
      empresa: empresa ? String(empresa) : 'Não informada',
      email: String(email),
      senhaHash
    }
  });

  const token = jwt.sign({ id: newUser.id }, JWT_SECRET, { expiresIn: '7d' });

  return res.status(201).json({
    message: 'Conta criada com sucesso!',
    user: { id: newUser.id, nome: newUser.nome, empresa: newUser.empresa, email: newUser.email },
    token
  });
});

app.post('/api/auth/login', async (req: Request, res: Response) => {
  const { email, senha } = req.body;

  const user = await prisma.user.findUnique({ where: { email: String(email) } });
  if (!user) {
    return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
  }

  const isPasswordValid = await bcrypt.compare(String(senha), user.senhaHash);
  if (!isPasswordValid) {
    return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
  }

  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });

  return res.json({
    user: { id: user.id, nome: user.nome, empresa: user.empresa, email: user.email },
    token
  });
});

app.get('/api/auth/me', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: String(req.userId) },
    select: { id: true, nome: true, empresa: true, email: true }
  });

  if (!user) {
    return res.status(404).json({ error: 'Usuário não encontrado.' });
  }

  return res.json({ user });
});

// --- ROTAS DE FRETES ---

app.get('/api/fretes', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const userFretes = await prisma.frete.findMany({
    where: { userId: String(req.userId) }
  });
  return res.json(userFretes);
});

app.post('/api/fretes', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const { origem, destino, valor } = req.body;

  if (!origem || !destino || !valor) {
    return res.status(400).json({ error: 'Origem, destino e valor são obrigatórios.' });
  }

  const newFrete = await prisma.frete.create({
    data: {
      userId: String(req.userId),
      codigo: `FRT-${Math.floor(1000 + Math.random() * 9000)}`,
      origem: String(origem),
      destino: String(destino),
      status: 'Pendente',
      valor: Number(valor),
      dataCriacao: new Date().toLocaleDateString('pt-BR')
    }
  });

  return res.status(201).json(newFrete);
});

app.put('/api/fretes/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const idParam = String(req.params.id);
  const { origem, destino, valor, status } = req.body;

  const freteExists = await prisma.frete.findFirst({
    where: { id: idParam, userId: String(req.userId) }
  });

  if (!freteExists) {
    return res.status(404).json({ error: 'Frete não encontrado.' });
  }

  const updatedFrete = await prisma.frete.update({
    where: { id: idParam },
    data: {
      origem: String(origem),
      destino: String(destino),
      valor: Number(valor),
      status: String(status)
    }
  });

  return res.json(updatedFrete);
});

app.delete('/api/fretes/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const idParam = String(req.params.id);

  const freteExists = await prisma.frete.findFirst({
    where: { id: idParam, userId: String(req.userId) }
  });

  if (!freteExists) {
    return res.status(404).json({ error: 'Frete não encontrado.' });
  }

  await prisma.frete.delete({
    where: { id: idParam }
  });

  return res.status(204).send();
});

// --- ROTAS DE MOTORISTAS ---

app.get('/api/motoristas', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const userMotoristas = await prisma.motorista.findMany({
    where: { userId: String(req.userId) }
  });
  return res.json(userMotoristas);
});

app.post('/api/motoristas', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const { nome, cpf, telefone, cnh } = req.body;

  if (!nome || !cpf || !telefone || !cnh) {
    return res.status(400).json({ error: 'Todos os campos do motorista são obrigatórios.' });
  }

  const newMotorista = await prisma.motorista.create({
    data: {
      userId: String(req.userId),
      nome: String(nome),
      cpf: String(cpf),
      telefone: String(telefone),
      cnh: String(cnh)
    }
  });

  return res.status(201).json(newMotorista);
});

app.put('/api/motoristas/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const idParam = String(req.params.id);
  const { nome, cpf, telefone, cnh } = req.body;

  const motoristaExists = await prisma.motorista.findFirst({
    where: { id: idParam, userId: String(req.userId) }
  });

  if (!motoristaExists) {
    return res.status(404).json({ error: 'Motorista não encontrado.' });
  }

  const updatedMotorista = await prisma.motorista.update({
    where: { id: idParam },
    data: {
      nome: String(nome),
      cpf: String(cpf),
      telefone: String(telefone),
      cnh: String(cnh)
    }
  });

  return res.json(updatedMotorista);
});

app.delete('/api/motoristas/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const idParam = String(req.params.id);

  const motoristaExists = await prisma.motorista.findFirst({
    where: { id: idParam, userId: String(req.userId) }
  });

  if (!motoristaExists) {
    return res.status(404).json({ error: 'Motorista não encontrado.' });
  }

  await prisma.motorista.delete({
    where: { id: idParam }
  });

  return res.status(204).send();
});

// --- ROTAS DE VEÍCULOS ---

app.get('/api/veiculos', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const userVeiculos = await prisma.veiculo.findMany({
    where: { userId: String(req.userId) }
  });
  return res.json(userVeiculos);
});

app.post('/api/veiculos', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const { placa, modelo, capacidade } = req.body;

  if (!placa || !modelo || !capacidade) {
    return res.status(400).json({ error: 'Todos os campos do veículo são obrigatórios.' });
  }

  const newVeiculo = await prisma.veiculo.create({
    data: {
      userId: String(req.userId),
      placa: String(placa).toUpperCase(),
      modelo: String(modelo),
      capacidade: String(capacidade),
      status: 'Disponível'
    }
  });

  return res.status(201).json(newVeiculo);
});

app.put('/api/veiculos/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const idParam = String(req.params.id);
  const { placa, modelo, capacidade, status } = req.body;

  const veiculoExists = await prisma.veiculo.findFirst({
    where: { id: idParam, userId: String(req.userId) }
  });

  if (!veiculoExists) {
    return res.status(404).json({ error: 'Veículo não encontrado.' });
  }

  const updatedVeiculo = await prisma.veiculo.update({
    where: { id: idParam },
    data: {
      placa: String(placa).toUpperCase(),
      modelo: String(modelo),
      capacidade: String(capacidade),
      status: String(status)
    }
  });

  return res.json(updatedVeiculo);
});

app.delete('/api/veiculos/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const idParam = String(req.params.id);

  const veiculoExists = await prisma.veiculo.findFirst({
    where: { id: idParam, userId: String(req.userId) }
  });

  if (!veiculoExists) {
    return res.status(404).json({ error: 'Veículo não encontrado.' });
  }

  await prisma.veiculo.delete({
    where: { id: idParam }
  });

  return res.status(204).send();
});

const PORT = 3333;
app.listen(PORT, () => {
  console.log(`🚀 Servidor Backend rodando com Banco de Dados SQLite na porta ${PORT}`);
});