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

- Node.js 24.11.1 (faixa suportada: >=24.11.0 <25)
- npm ou yarn

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Ajuste a conexão com um MySQL LOCAL de desenvolvimento no arquivo .env
npx prisma generate
npx prisma migrate deploy
# Opcional: crie contas de QA apenas com npm run seed:test em desenvolvimento/homologação.
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

### Contas fictícias para desenvolvimento/homologação

O comando `npm run seed:test` cria de forma idempotente um administrador e dois advogados com e-mails reservados no domínio `.test`. Ele não redefine o banco nem remove registros. Execute-o somente em desenvolvimento ou homologação, com `NODE_ENV` e `LEXFLOW_ALLOW_TEST_USERS=true` definidos e as variáveis `LEXFLOW_TEST_ADMIN_PASSWORD`, `LEXFLOW_TEST_LAWYER1_PASSWORD` e `LEXFLOW_TEST_LAWYER2_PASSWORD` preenchidas com senhas fortes diferentes. As senhas são validadas e gravadas somente como hash bcrypt; não são armazenadas no repositório.

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

Abra: `http://localhost:5173/tecti/2026/gpec02/`

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

## Deploy

### Frontend — Hostinger / Apache

Diretório: `frontend/`. Instale com `npm install` (ou `npm ci` para reproduzir o lockfile).
Copie `.env.production.example` para `.env.production` e preencha `VITE_API_URL` com a URL HTTPS real do Render **seguida de `/api`**. Variáveis Vite são públicas e incorporadas na build, não lidas pelo Apache.

O caminho público é `/tecti/2026/gpec02/`, definido em `vite.config.js` (`base`). O `BrowserRouter` usa `import.meta.env.BASE_URL`. Se mudar o caminho, ajuste também `public/.htaccess`.
Execute `npm run build`. A saída é `frontend/dist/`, incluindo `.htaccess`, manifesto, ícone e assets. Sem URL de produção válida, a build falha intencionalmente.

> Transfira o CONTEÚDO da pasta `dist` para a pasta correspondente ao projeto no servidor Apache.

No FileZilla, mostre arquivos ocultos e inclua `.htaccess` junto de `index.html` em `/tecti/2026/gpec02/` (relativo à raiz pública do domínio). Não crie uma pasta `dist` dentro desse caminho. O Apache precisa de `mod_rewrite` e permitir estas diretivas via `AllowOverride`.

### Backend — Render

- Diretório e Root Directory: `backend`.
- Runtime: Node; versão recomendada `24.11.1`, definida em `backend/.node-version`.
- Build Command: `npm ci --omit=dev && npx prisma generate`.
- Start Command: `npm start` (`node server.js`, sem nodemon).
- Health Check Path: `/health` (também preservado `/api/health`).
- Variáveis: `NODE_ENV=production`, `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`.
- O Render fornece `PORT`: não a crie manualmente. Bind em `0.0.0.0`.
- `FRONTEND_URL`: origem HTTPS real da Hostinger, sem subpasta. CORS aceita apenas as origens configuradas; `CORS_ALLOWED_ORIGINS` permanece como alternativa legada. Prefira configurar somente `FRONTEND_URL`.
- Prisma Client é dependência de runtime; o CLI também está disponível para geração e migrations.
- Execute `npx prisma migrate deploy` manualmente antes de iniciar a versão que exige a migration, nunca acoplado ao start. Não há build/transpilação JavaScript no backend.
- Recomenda-se Auto Deploy desabilitado no primeiro deploy; habilite depois da validação integrada e de estabelecer a etapa de migrations.

### Banco

MySQL externo via Prisma 6.19.3. `DATABASE_URL=mysql://USUARIO:SENHA_URL_ENCODED@HOST:PORTA/BANCO` (substitua os marcadores; não publique credenciais). Configure acesso remoto/firewall para o Render e TLS conforme seu provedor; não desabilite a verificação de certificados.

A migration `20261021000000_init_mysql` cria as tabelas e relações do schema atual. Foi gerada sem conectar a banco e **não foi aplicada**. Para banco vazio autorizado: `npx prisma migrate deploy`; confira `npx prisma migrate status`. Para banco existente, faça backup, compare o schema e prepare um baseline revisado antes de executar qualquer migration. A troca de SQLite para MySQL não transfere dados automaticamente.

Há seed apenas de teste/homologação: não execute `npm run seed:test` em produção. O cadastro público cria perfil `usuario`; o primeiro administrador real deve ser provisionado manualmente por responsável autorizado, sem usar contas fictícias.

**Segurança:** há credenciais MySQL remotas e JWT no histórico de `backend/.env`. Rotacione/substitua essas credenciais antes de publicar. `.gitignore` não remove segredos do histórico.

Consulte [DEPLOY.md](DEPLOY.md) para sequência operacional, pendências, testes e configuração copiável. Esta seção prevalece sobre instruções antigas dos relatórios históricos.
