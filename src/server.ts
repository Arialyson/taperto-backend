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

// Rotas de Autenticação
app.post('/api/auth/register', async (req: Request, res: Response) => {
  const { nome, empresa, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ error: 'Preencha todos os campos obrigatórios.' });
  }

  const userExists = await prisma.user.findUnique({ where: { email } });
  if (userExists) {
    return res.status(400).json({ error: 'Este e-mail já está em uso.' });
  }

  const senhaHash = await bcrypt.hash(senha, 8);

  const newUser = await prisma.user.create({
    data: {
      nome,
      empresa: empresa || 'Não informada',
      email,
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

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ error: 'E-mail ou palavra-passe incorretos.' });
  }

  const isPasswordValid = await bcrypt.compare(senha, user.senhaHash);
  if (!isPasswordValid) {
    return res.status(401).json({ error: 'E-mail ou palavra-passe incorretos.' });
  }

  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });

  return res.json({
    user: { id: user.id, nome: user.nome, empresa: user.empresa, email: user.email },
    token
  });
});

app.get('/api/auth/me', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { id: true, nome: true, empresa: true, email: true }
  });

  if (!user) {
    return res.status(404).json({ error: 'Utilizador não encontrado.' });
  }

  return res.json({ user });
});

// Rotas de Fretes
app.get('/api/fretes', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const userFretes = await prisma.frete.findMany({
    where: { userId: req.userId }
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
      userId: req.userId!,
      codigo: `FRT-${Math.floor(1000 + Math.random() * 9000)}`,
      origem,
      destino,
      status: 'Pendente',
      valor: Number(valor),
      dataCriacao: new Date().toLocaleDateString('pt-PT')
    }
  });

  return res.status(201).json(newFrete);
});

// Rotas de Motoristas
app.get('/api/motoristas', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const userMotoristas = await prisma.motorista.findMany({
    where: { userId: req.userId }
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
      userId: req.userId!,
      nome,
      cpf,
      telefone,
      cnh
    }
  });

  return res.status(201).json(newMotorista);
});

// Rotas de Veículos
app.get('/api/veiculos', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const userVeiculos = await prisma.veiculo.findMany({
    where: { userId: req.userId }
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
      userId: req.userId!,
      placa: placa.toUpperCase(),
      modelo,
      capacidade,
      status: 'Disponível'
    }
  });

  return res.status(201).json(newVeiculo);
});

const PORT = 3333;
app.listen(PORT, () => {
  console.log(`🚀 Servidor Backend rodando com Banco de Dados SQLite na porta ${PORT}`);
});