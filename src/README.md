# 🚚 TáPerto — API & Backend

Backend para a plataforma de logística **TáPerto**, responsável pelo gerenciamento de fretes, motoristas, veículos, autenticação de empresas e disponibilização de rotas públicas de rastreamento via QR Code.

---

## 🛠️ Tecnologias Utilizadas

- **Node.js** com **TypeScript**
- **Express**: Framework HTTP para roteamento e middlewares
- **Prisma ORM**: Abstração e manipulação do banco de dados
- **SQLite** (Ambiente de Desenvolvimento) / **PostgreSQL** (Preparado para Produção / Supabase)
- **JWT (JSON Web Token)**: Autenticação de sessões e proteção de rotas
- **Bcrypt.js**: Criptografia e segurança de senhas

---

## 📁 Estrutura do Projeto

```text
taperto-backend/
├── prisma/
│   ├── schema.prisma       # Definição dos modelos do banco de dados
│   └── dev.db              # Banco de dados SQLite (Local Dev)
├── src/
│   ├── controllers/        # Lógica de controle das requisições
│   ├── middlewares/        # Proteção JWT e validações
│   ├── routes/             # Definição das rotas da API
│   ├── services/           # Regras de negócio da aplicação
│   └── server.ts           # Ponto de entrada do servidor HTTP
├── .env.example            # Variáveis de ambiente de exemplo
├── package.json            # Dependências e scripts do projeto
└── tsconfig.json           # Configurações do TypeScript