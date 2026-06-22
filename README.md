# LexFlow - Sistema de Gestão Jurídica

Um sistema de gestão de processos jurídicos desenvolvido como projeto de TCC, com backend em Node.js, frontend em React e banco de dados MySQL usando Prisma.

## 📋 Visão Geral

O LexFlow é uma aplicação para gestão de processos jurídicos, permitindo cadastro e acompanhamento de clientes e processos, além de fornecer métricas iniciais para o time jurídico.

## 🎯 Objetivo do Projeto

Criar uma base técnica organizada para o MVP, validando a estrutura do repositório, a integração backend ↔ banco via Prisma e a conexão inicial frontend ↔ backend.

## ✅ Funcionalidades do MVP

- Cadastro e login de usuários
- Cadastro de clientes
- Cadastro de processos jurídicos
- Listagem de processos e clientes
- Atualização e exclusão de processos
- Dashboard inicial com métricas
- Conexão frontend-backend via API

## 🛠️ Tecnologias Utilizadas

- Frontend: React, Vite, Tailwind CSS
- Backend: Node.js, Express, Prisma ORM
- Banco de Dados: MySQL
- Autenticação: JWT
- Comunicação: REST API

## 📁 Estrutura do Projeto

```
lexflow-sistema-juridico/
│
├── backend/
│   ├── controllers/         # Lógica de rotas e operações com Prisma
│   ├── middleware/          # Middleware de autenticação
│   ├── routes/              # Rotas da API
│   ├── prisma/              # Schema Prisma e migrações
│   ├── generated/           # Prisma client gerado
│   ├── server.js            # Servidor Express
│   ├── db.js                # Conexão Prisma
│   ├── package.json
│   ├── .env.example
│   └── prisma/seed.js       # Seed de dados iniciais
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Componentes React
│   │   ├── pages/           # Páginas da aplicação
│   │   ├── styles/          # Estilos e CSS
│   │   ├── api.js           # Cliente Axios para API
│   │   └── App.jsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── README.md
└── Insomnia_LexFlow.json    # Exportação das rotas do Insomnia
```

## 🚀 Instalação e Execução

### Pré-requisitos

- Node.js (versão 16 ou superior)
- npm ou yarn

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Ajuste as credenciais do servidor de produção no arquivo .env
npx prisma generate
npx prisma db push
npm run seed
npm run dev
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## 🌐 URLs Locais

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- Health check: `http://localhost:5000/api/health`

## 🔧 Banco de Dados

Este projeto usa MySQL via Prisma ORM. A configuração da conexão está em `backend/.env`.

### Usuário de exemplo após seed

- Email: `admin@lexflow.com`
- Senha: `Senha123!`

## 🧪 Testes e Validação

### Verificar Backend

Abra o navegador e acesse: `http://localhost:5000/api/health`

**Resposta esperada:**

```json
{
  "status": "OK",
  "message": "LexFlow API is running"
}
```

### Verificar Frontend

Abra: `http://localhost:5173/`

A interface deve carregar e permitir login/cadastro.

### Testar Fluxo Básico

1. Faça login com o usuário de exemplo ou cadastre uma nova conta
2. Crie um cliente no módulo de clientes
3. Crie um processo no módulo de processos usando um cliente existente
4. Verifique se os dados aparecem na lista de processos

## 📊 Funcionalidades

- Cadastro de clientes
- Cadastro de processos
- Listagem de processos com cliente vinculado
- Atualização e exclusão de processos
- Login e cadastro de usuário
- API com rotas autenticadas via JWT

## 🔧 API Endpoints

| Método | Endpoint                 | Descrição                             |
| ------ | ------------------------ | ------------------------------------- |
| GET    | `/api/health`            | Health check da API                   |
| POST   | `/api/auth/register`     | Cadastra novo usuário                 |
| POST   | `/api/auth/login`        | Autentica usuário                     |
| GET    | `/api/auth/profile`      | Retorna perfil do usuário autenticado |
| GET    | `/api/clientes`          | Lista clientes                        |
| POST   | `/api/clientes`          | Cria novo cliente                     |
| PUT    | `/api/clientes/:id`      | Atualiza cliente                      |
| DELETE | `/api/clientes/:id`      | Exclui cliente                        |
| GET    | `/api/processos`         | Lista processos                       |
| POST   | `/api/processos`         | Cria novo processo                    |
| PUT    | `/api/processos/:id`     | Atualiza processo                     |
| DELETE | `/api/processos/:id`     | Exclui processo                       |
| GET    | `/api/dashboard/metrics` | Retorna métricas do dashboard         |

## 📄 Insomnia

O arquivo `Insomnia_LexFlow.json` contém as requisições organizadas por funcionalidade, incluindo login, cadastro de clientes, cadastro de processos e métricas.

## 🚀 Entregável AV2

- Repositório organizado com frontend e backend separados
- README atualizado com instruções e divisão de responsabilidades
- Banco de dados modelado com Prisma e conectado ao MySQL
- Backend configurado e rodando com Express
- Rotas testadas no Insomnia e exportadas
- Frontend iniciado em React com JavaScript e Tailwind
- Conexão inicial entre frontend e backend via API

## 🚧 Próximos Passos

- Melhorar interface de processos e clientes
- Implementar autorização por perfil de usuário
- Adicionar upload de documentos e relatórios
- Criar dashboard com gráficos e filtros

## 📄 Licença

ISC
