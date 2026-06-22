# 📊 Relatório de Análise do Projeto

## 1. 🏗️ Identificação e visão geral

- **Nome do projeto:** LexFlow
- **Objetivo identificado:** sistema SaaS para gestão de processos jurídicos, clientes e métricas operacionais.
- **Problema que o sistema pretende resolver:** organização e acompanhamento de processos jurídicos, prazos, clientes e informações associadas.
- **Funcionalidades do MVP descritas:**
  - autenticação de usuários;
  - CRUD de processos;
  - CRUD de clientes;
  - dashboard com métricas;
  - integração frontend-backend por API REST.
- **Tecnologias principais:**
  - React
  - Vite
  - Node.js
  - Express
  - Prisma ORM
  - MySQL
  - Tailwind CSS
  - Axios
  - JWT
- **Linguagens utilizadas:**
  - JavaScript
  - CSS
  - SQL
  - Prisma Schema
  - TypeScript apenas em arquivo de configuração Prisma (`backend/prisma.config.ts`)

### Evidências consultadas

- `README.md` — identifica o projeto como “LexFlow - Sistema de Gestão Jurídica” e descreve CRUD de processos.
- `README_COMPLETO.md` — descreve o LexFlow como sistema SaaS para processos jurídicos, clientes e tarefas.
- `backend/package.json` — identifica backend Node.js/Express com Prisma, JWT, bcryptjs e CORS.
- `frontend/package.json` — identifica frontend React 18, Vite, Axios, Tailwind CSS e Lucide React.
- `backend/prisma/schema.prisma` — define models `User`, `Cliente` e `Processo`.
- `frontend/src/api.js` — define cliente Axios e endpoints de autenticação, processos, clientes e dashboard.

## 2. 📂 Organização do repositório

```text
tcc-lexflow/
├── README.md
├── README_COMPLETO.md
├── PROMPT_ANALISE_REPOSITORIO_AV2_PIS.md
├── package-lock.json
├── backend/
│   ├── .env
│   ├── .env.example
│   ├── .gitignore
│   ├── db.js
│   ├── package.json
│   ├── prisma.config.ts
│   ├── server.js
│   ├── controllers/
│   ├── middleware/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── routes/
│   └── services/
└── frontend/
    ├── index.html
    ├── package.json
    ├── postcss.config.js
    ├── tailwind.config.js
    ├── vite.config.js
    └── src/
        ├── App.jsx
        ├── api.js
        ├── main.jsx
        ├── components/
        ├── pages/
        └── styles/
```

### Responsabilidade das pastas

- `backend` — API Node.js/Express, rotas, controllers, middleware de autenticação, serviço de autenticação e configuração Prisma.
- `backend/controllers` — funções que tratam requisições e executam operações Prisma.
- `backend/routes` — definição dos endpoints HTTP.
- `backend/middleware` — autenticação JWT.
- `backend/services` — funções de hash de senha, comparação de senha e geração de token.
- `backend/prisma` — schema Prisma e migrations do banco.
- `frontend` — aplicação React/Vite.
- `frontend/src/components` — componentes reutilizáveis de interface.
- `frontend/src/pages` — páginas principais de Dashboard, Processos e Clientes.
- `frontend/src/styles` — arquivos CSS globais e específicos.

### Análise da organização

- Separação entre frontend e backend: adequada. Há pastas independentes para API e interface.
- Nomes de pastas e arquivos: claros e coerentes com responsabilidades (`controllers`, `routes`, `middleware`, `services`, `pages`, `components`).
- Arquivos de configuração: presentes para Vite, Tailwind, PostCSS, Prisma, npm e variáveis de ambiente de exemplo.
- Organização mínima do projeto: atende. Porém há `node_modules` e `backend/generated` presentes no repositório local, que são pastas geradas/de dependências e não deveriam compor a estrutura analisada como entrega principal.

## 3. 📘 README e documentação inicial

**Localização:** `README.md` e `README_COMPLETO.md`

| Item esperado | Situação | Evidência |
|---|---|---|
| Nome do projeto | Atende | `README.md` e `README_COMPLETO.md` identificam “LexFlow”. |
| Problema que o sistema resolve | Parcial | `README.md` descreve gestão de processos jurídicos; não aprofunda o problema. |
| Objetivo do projeto | Atende | `README.md` e `README_COMPLETO.md` indicam sistema SaaS de gestão jurídica. |
| Funcionalidades do MVP | Atende | `README_COMPLETO.md` lista autenticação, CRUD de processos, CRUD de clientes e dashboard. |
| Tecnologias utilizadas | Atende | `README_COMPLETO.md` lista Node.js, Express, Prisma, React, Vite, Tailwind e Axios. |
| Instruções para execução local | Atende | `README.md` e `README_COMPLETO.md` têm passos de instalação e execução. |
| Divisão entre frontend, backend e banco | Atende | `README_COMPLETO.md` apresenta estrutura com backend, frontend e Prisma. |

### Histórico de commits e participação

- Histórico disponível para análise: Sim.
- Participação dos integrantes identificável: Parcial.
- Evidências: `git log` mostra commits de `karemc`, `Karem De Oliveira Coutinho`, `EA - Karem De Oliveira Coutinho` e `hfcosta`. Não há, pelo repositório local, evidência suficiente para validar a divisão de tarefas de todos os integrantes.

> Não foi atribuída autoria individual de funcionalidades específicas sem evidências completas.

### Professor como colaborador

**Situação:** NÃO VERIFICÁVEL PELO REPOSITÓRIO

Observação: `README_COMPLETO.md` cita “Orientador: h-fcosta” e o histórico local mostra commits de `hfcosta`, mas a condição de colaborador no GitHub depende de permissão/configuração externa e não pode ser confirmada apenas pelo repositório local.

## 4. ⚙️ Backend

- **Localização:** `backend`
- **Linguagem:** JavaScript
- **Framework principal:** Express
- **Arquivo de inicialização:** `backend/server.js`
- **Servidor configurado:** Sim

### Estrutura identificada

- `backend/server.js` — configura Express, CORS, JSON, rotas e health check.
- `backend/db.js` — instancia `PrismaClient` e conecta ao banco.
- `backend/routes/auth.js` — rotas de autenticação.
- `backend/routes/processos.js` — rotas de processos protegidas por autenticação.
- `backend/routes/clientes.js` — rotas de clientes protegidas por autenticação.
- `backend/routes/dashboard.js` — rota de métricas protegida por autenticação.
- `backend/controllers` — controllers de auth, clientes, processos e dashboard.
- `backend/middleware/auth.js` — valida token JWT.
- `backend/services/authService.js` — hash, comparação de senha e geração de JWT.

### Organização interna

- Rotas: presentes e separadas por domínio.
- Controllers: presentes e utilizados pelas rotas.
- Services: presente para autenticação.
- Middlewares: presente para autenticação JWT.
- Configuração do banco: presente em `backend/db.js`, `backend/prisma/schema.prisma` e `backend/prisma.config.ts`.
- Validações: existem validações básicas de campos obrigatórios nos controllers.
- Tratamento de erros: existe retorno JSON com status HTTP, em geral por `try/catch`.

### Funcionalidades implementadas

- Registro de usuário — Evidência: `backend/controllers/authController.js`.
- Login com validação de senha e geração de token — Evidência: `backend/controllers/authController.js` e `backend/services/authService.js`.
- Consulta de perfil autenticado — Evidência: `backend/routes/auth.js` e `backend/controllers/authController.js`.
- CRUD de clientes — Evidência: `backend/controllers/clienteController.js`.
- CRUD de processos — Evidência: `backend/controllers/processoController.js`.
- Métricas de dashboard por usuário — Evidência: `backend/controllers/dashboardController.js`.
- Health check — Evidência: `backend/server.js`.

### Fluxo das requisições

```text
requisição → rota Express → middleware JWT quando aplicável → controller → Prisma Client → banco de dados → resposta JSON
```

O fluxo está completo para autenticação, clientes, processos e dashboard. A inicialização depende da conexão Prisma configurada por variáveis de ambiente. Há inconsistência documental: `backend/server.js` registra no console “Database: SQLite”, mas `backend/prisma/schema.prisma` usa `provider = "mysql"`.

## 5. 🗄️ Banco de dados e Prisma ORM

- **Tipo de banco:** MySQL
- **ORM:** Prisma
- **Configuração principal:** `backend/prisma.config.ts`
- **Schema Prisma:** `backend/prisma/schema.prisma`
- **Migrations:** Sim
- **Localização das migrations:** `backend/prisma/migrations/20260527110027_init/migration.sql`

### Models ou entidades identificadas

- `User` — usuário do sistema, com `id`, `email`, `password`, `nome`, `perfil`, `ativo`, datas e relações com processos/clientes.
- `Cliente` — cliente jurídico vinculado a usuário, com dados de identificação, contato, endereço, observações e status ativo.
- `Processo` — processo jurídico vinculado a usuário e cliente, com título, área, prazo, status, descrição e prioridade.

### Modelagem

| Elemento | Situação | Evidência |
|---|---|---|
| Models principais definidos | Atende | `backend/prisma/schema.prisma` |
| Chaves primárias | Atende | `@id @default(cuid())` nos models |
| Chaves estrangeiras e relações | Atende | Relações `User` → `Cliente`, `User` → `Processo`, `Cliente` → `Processo` |
| Campos coerentes com o domínio | Atende | `Cliente` e `Processo` possuem campos compatíveis com gestão jurídica |
| Prisma Client utilizado no backend | Atende | `backend/db.js` importa e instancia `PrismaClient` |
| Operação real de banco em rota/controller | Atende | Controllers usam `findMany`, `findUnique`, `findFirst`, `create`, `update`, `delete`, `count` e `groupBy` |

### Operações Prisma encontradas

- `findMany`, `findUnique` ou equivalente: `backend/controllers/authController.js`, `backend/controllers/clienteController.js`, `backend/controllers/processoController.js`.
- `create`: `backend/controllers/authController.js`, `backend/controllers/clienteController.js`, `backend/controllers/processoController.js`.
- `update`: `backend/controllers/clienteController.js`, `backend/controllers/processoController.js`.
- `delete`: `backend/controllers/clienteController.js`, `backend/controllers/processoController.js`.
- Outras operações: `count` e `groupBy` em `backend/controllers/dashboardController.js`; `$connect` em `backend/db.js`.

### Banco no servidor de produção

A existência de `backend/.env`, `backend/.env.example`, `backend/prisma.config.ts` e commits relacionados à configuração de banco indicam preparação para conexão, mas não comprovam criação efetiva no servidor de produção.

**Situação:** PARCIALMENTE EVIDENCIADO

Não foi exposto o conteúdo de variáveis sensíveis.

## 6. 🌐 Rotas da API e arquivo do Insomnia

### Rotas encontradas no backend

| Método | Endpoint | Arquivo | Operação realizada | Usa Prisma |
|---|---|---|---|---|
| POST | `/api/auth/register` | `backend/routes/auth.js` | registra usuário | Sim |
| POST | `/api/auth/login` | `backend/routes/auth.js` | autentica usuário | Sim |
| GET | `/api/auth/profile` | `backend/routes/auth.js` | retorna perfil autenticado | Sim |
| GET | `/api/processos` | `backend/routes/processos.js` | lista processos do usuário | Sim |
| GET | `/api/processos/:id` | `backend/routes/processos.js` | busca processo por ID e usuário | Sim |
| POST | `/api/processos` | `backend/routes/processos.js` | cria processo | Sim |
| PUT | `/api/processos/:id` | `backend/routes/processos.js` | atualiza processo | Sim |
| DELETE | `/api/processos/:id` | `backend/routes/processos.js` | exclui processo | Sim |
| GET | `/api/clientes` | `backend/routes/clientes.js` | lista clientes do usuário | Sim |
| GET | `/api/clientes/:id` | `backend/routes/clientes.js` | busca cliente por ID e usuário | Sim |
| POST | `/api/clientes` | `backend/routes/clientes.js` | cria cliente | Sim |
| PUT | `/api/clientes/:id` | `backend/routes/clientes.js` | atualiza cliente | Sim |
| DELETE | `/api/clientes/:id` | `backend/routes/clientes.js` | exclui cliente | Sim |
| GET | `/api/dashboard/metrics` | `backend/routes/dashboard.js` | retorna métricas | Sim |
| GET | `/api/health` | `backend/server.js` | health check | Não |

### Adequação das rotas

- Uso adequado dos métodos HTTP: adequado para CRUD e consultas.
- Organização por funcionalidade: adequada, com arquivos separados por domínio.
- Clareza dos nomes: adequada.
- Existência de parâmetros: presente em rotas `/:id`.
- Recebimento de JSON: configurado por `app.use(express.json())`.
- Respostas em JSON: presente nos controllers e health check.
- Relação com o MVP: rotas cobrem autenticação, clientes, processos e dashboard descritos no README completo.

### Arquivo exportado do Insomnia

- **Arquivo encontrado:** NÃO IDENTIFICADO
- **Formato:** NÃO IDENTIFICADO
- **Rotas organizadas por funcionalidade:** Não
- **Nomes claros nas requisições:** Não
- **Exemplos de corpo JSON:** Não
- **Parâmetros e variáveis configurados:** Não
- **Compatibilidade com as rotas do backend:** Não

Não foi identificado arquivo de exportação do Insomnia ou coleção equivalente no repositório.

## 7. 🎨 Frontend

- **Localização:** `frontend`
- **Framework:** React
- **Linguagem:** JavaScript
- **Ferramenta de criação/build:** Vite
- **Tailwind CSS:** Parcial. Há `tailwind.config.js` e dependência instalada, mas os estilos principais são CSS próprio; não foram encontrados diretivas `@tailwind` nos CSS lidos.
- **Roteamento:** NÃO IDENTIFICADO. A navegação é controlada por estado local em `frontend/src/App.jsx`, não por biblioteca de rotas.

### Arquivos principais

- `frontend/src/main.jsx` — ponto de entrada React.
- `frontend/src/App.jsx` — controla autenticação, layout e troca de seções.
- `frontend/src/api.js` — cliente Axios para comunicação com backend.
- `frontend/tailwind.config.js` — configuração de conteúdo do Tailwind.
- `frontend/vite.config.js` — configuração do Vite.

### Páginas e componentes

- `frontend/src/pages/Dashboard.jsx` — consome métricas e exibe cards/gráficos simples.
- `frontend/src/pages/Processos.jsx` — tela de listagem e formulário de processos.
- `frontend/src/pages/Clientes.jsx` — tela de listagem e formulário de clientes.
- `frontend/src/components/LoginForm.jsx` — formulário de login integrado à API.
- `frontend/src/components/ProcessosTable.jsx` — lista e exclui processos via API.
- `frontend/src/components/ProcessoForm.jsx` — cria e atualiza processos via API.
- `frontend/src/components/ClientesTable.jsx` — lista e exclui clientes via API.
- `frontend/src/components/ClienteForm.jsx` — cria e atualiza clientes via API.
- `frontend/src/components/Sidebar.jsx` — navegação lateral.
- `frontend/src/components/Header.jsx` — cabeçalho com busca visual, usuário e logout.

### Análise do desenvolvimento inicial

| Elemento | Situação | Evidência |
|---|---|---|
| Projeto React iniciado | Atende | `frontend/src/main.jsx`, `frontend/package.json` |
| Uso de JavaScript | Atende | Arquivos `.jsx` e `.js` no frontend |
| Tailwind configurado ou utilizado | Parcial | `frontend/tailwind.config.js`, `frontend/postcss.config.js`, classes utilitárias em componentes; ausência de diretivas `@tailwind` nos CSS lidos |
| Telas principais iniciadas | Atende | `Dashboard.jsx`, `Processos.jsx`, `Clientes.jsx`, `LoginForm.jsx` |
| Componentes organizados | Atende | `frontend/src/components` |
| Navegação entre páginas | Parcial | navegação por estado em `App.jsx`, sem roteador dedicado |
| Tela conectada ou preparada para API | Atende | `frontend/src/api.js`, páginas e componentes chamando APIs |

## 8. 🔗 Conexão entre frontend e backend

- **Tipo de comunicação:** REST
- **Cliente HTTP:** Axios
- **Arquivo de configuração da API:** `frontend/src/api.js`
- **URL base:** `http://localhost:5000/api`, com possibilidade de sobrescrita por `VITE_API_BASE_URL`, em `frontend/src/api.js`.
- **Variáveis de ambiente:** `backend/.env` e `backend/.env.example`; não foi identificado `.env` do frontend.
- **CORS no backend:** Configurado por `app.use(cors())` em `backend/server.js`.
- **Proxy no frontend:** Ausente.

### Endpoints consumidos pelo frontend

| Endpoint | Método | Componente ou página | Finalidade | Compatível com o backend |
|---|---|---|---|---|
| `/auth/login` | POST | `frontend/src/components/LoginForm.jsx` | login | Sim |
| `/auth/register` | POST | `frontend/src/api.js` | registro disponível no cliente API | Sim |
| `/auth/profile` | GET | `frontend/src/api.js` | perfil disponível no cliente API | Sim |
| `/processos` | GET | `frontend/src/components/ProcessosTable.jsx` | listar processos | Sim |
| `/processos` | POST | `frontend/src/components/ProcessoForm.jsx` | criar processo | Sim |
| `/processos/:id` | PUT | `frontend/src/components/ProcessoForm.jsx` | atualizar processo | Sim |
| `/processos/:id` | DELETE | `frontend/src/components/ProcessosTable.jsx` | excluir processo | Sim |
| `/clientes` | GET | `frontend/src/pages/Processos.jsx` e `frontend/src/components/ClientesTable.jsx` | listar clientes | Sim |
| `/clientes` | POST | `frontend/src/components/ClienteForm.jsx` | criar cliente | Sim |
| `/clientes/:id` | PUT | `frontend/src/components/ClienteForm.jsx` | atualizar cliente | Sim |
| `/clientes/:id` | DELETE | `frontend/src/components/ClientesTable.jsx` | excluir cliente | Sim |
| `/dashboard/metrics` | GET | `frontend/src/pages/Dashboard.jsx` | buscar métricas | Sim |

### Fluxos comprovados

- Login envia email e senha para `/auth/login`, salva token e usuário no `localStorage`.
- O interceptor Axios adiciona `Authorization: Bearer <token>` às requisições autenticadas.
- Tela de Dashboard consome `/dashboard/metrics`.
- Tela de Processos lista, cria, atualiza e exclui processos.
- Tela de Clientes lista, cria, atualiza e exclui clientes.
- Formulário de Processo exige `clienteId`, compatível com o backend, que valida cliente pertencente ao usuário.

### Estado da integração

**Classificação:** Atende.

Há comunicação identificável e coerente entre frontend e backend via Axios, endpoints compatíveis e token JWT. A integração não foi executada em ambiente real nesta análise, portanto funcionamento em runtime depende da configuração correta do banco e das variáveis de ambiente.

## 9. ✅ O que já está implementado

### Backend

- Servidor Express com CORS, JSON e health check.
- Rotas de autenticação, processos, clientes e dashboard.
- Middleware JWT aplicado em rotas protegidas.
- Controllers com operações reais no Prisma.
- Hash de senha com bcryptjs e geração de JWT.

### Banco de dados

- Schema Prisma com models `User`, `Cliente` e `Processo`.
- Relações entre usuários, clientes e processos.
- Migration SQL inicial para MySQL.
- Configuração Prisma com uso de `DATABASE_URL`.

### Frontend

- Aplicação React/Vite iniciada.
- Tela de login.
- Layout com sidebar e header.
- Páginas de Dashboard, Processos e Clientes.
- Componentes de tabela e formulário para clientes e processos.
- Estilos CSS e configuração parcial de Tailwind.

### Integração

- Cliente Axios configurado.
- Base URL configurável por variável `VITE_API_BASE_URL`.
- Token JWT incluído automaticamente nas requisições.
- Consumo de endpoints de auth, clientes, processos e dashboard.

## 10. 🚧 O que está incompleto ou em desenvolvimento

- Arquivo exportado do Insomnia não encontrado.
  - **Evidência:** varredura de arquivos não identificou export/collection do Insomnia.
  - **Estado observado:** entregável específico ausente no repositório.

- README principal desatualizado em relação ao código.
  - **Evidência:** `README.md` descreve SQLite e CRUD simples de processos; `backend/prisma/schema.prisma` usa MySQL e o código contém auth, clientes e dashboard.
  - **Estado observado:** documentação principal não reflete completamente a implementação atual.

- Seed citado na documentação não encontrado.
  - **Evidência:** `README_COMPLETO.md` menciona `backend/prisma/seed.js`; a pasta `backend/prisma` contém `schema.prisma` e `migrations`, mas não contém `seed.js`.
  - **Estado observado:** instrução de seed e credenciais de teste dependem de arquivo não identificado.

- Tailwind presente de forma parcial.
  - **Evidência:** `frontend/tailwind.config.js` e `frontend/postcss.config.js` existem; os CSS lidos não contêm diretivas `@tailwind`.
  - **Estado observado:** configuração existe, mas os estilos principais são CSS próprio.

- Confirmação de banco em produção.
  - **Evidência:** `backend/.env.example`, `backend/prisma.config.ts` e migration MySQL existem.
  - **Estado observado:** criação efetiva em servidor externo não pode ser confirmada pelo repositório.

- Módulo de configurações.
  - **Evidência:** `frontend/src/App.jsx`.
  - **Estado observado:** exibido como “Módulo de configurações em desenvolvimento.”

## 11. 📦 Dependências principais

### Backend

| Dependência | Versão | Finalidade identificada |
|---|---:|---|
| `express` | `^4.22.1` | servidor HTTP e rotas |
| `@prisma/client` | `^7.8.0` | acesso ORM ao banco |
| `prisma` | `^7.8.0` | CLI e migrations, devDependency |
| `@prisma/adapter-mariadb` | `^7.8.0` | adaptador MariaDB/MySQL |
| `cors` | `^2.8.6` | habilitar CORS |
| `dotenv` | `^16.6.1` | variáveis de ambiente |
| `bcryptjs` | `^3.0.3` | hash e comparação de senha |
| `jsonwebtoken` | `^9.0.3` | autenticação JWT |
| `nodemon` | `^3.1.14` | servidor em desenvolvimento, devDependency |

### Frontend

| Dependência | Versão | Finalidade identificada |
|---|---:|---|
| `react` | `^18.2.0` | biblioteca de UI |
| `react-dom` | `^18.2.0` | renderização React no DOM |
| `vite` | `^4.2.0` | ferramenta de build/dev server, devDependency |
| `@vitejs/plugin-react` | `^3.1.0` | plugin React para Vite, devDependency |
| `axios` | `^1.15.2` | cliente HTTP |
| `tailwindcss` | `^3.4.5` | utilitários CSS, devDependency |
| `postcss` | `^8.4.35` | processamento CSS, devDependency |
| `autoprefixer` | `^10.4.19` | prefixos CSS, devDependency |
| `lucide-react` | `^0.518.0` | ícones |
| `framer-motion` | `^11.0.0` | animações; dependência listada, uso direto não identificado nos arquivos lidos |

## 12. 🧭 Arquitetura e padrões identificados

- **Arquitetura predominante:** camadas simples com separação entre rotas, controllers, middleware, services e acesso Prisma.
- **Separação de responsabilidades:** adequada no backend; frontend organizado por páginas e componentes.
- **Padrões identificados:** API REST, controllers assíncronos com `try/catch`, middleware JWT, cliente HTTP centralizado, CRUD por domínio.
- **Consistência entre os módulos:** boa entre rotas, controllers e frontend. Há inconsistência entre documentação e implementação quanto a SQLite/MySQL, presença de seed e escopo do MVP.

# 13. 📝 Avaliação conforme os critérios da AV2

## Regras de pontuação

A pontuação abaixo considera apenas evidências disponíveis no repositório local. Itens dependentes de GitHub, apresentação oral, produção ou execução externa foram marcados como não verificáveis quando aplicável.

## Quadro avaliativo

| Critério | Valor máximo | Nota atribuída | Evidências e justificativa |
|---|---:|---:|---|
| Organização do repositório, README e professor como colaborador | 1,5 | 1,0 | Estrutura frontend/backend adequada e documentação existente, mas README principal está desatualizado e há pastas geradas/de dependências no repositório local. Professor como colaborador é NÃO VERIFICÁVEL PELO REPOSITÓRIO. |
| Banco de dados criado e coerente com o MVP | 2,0 | 1,7 | Schema Prisma e migration MySQL existem com entidades coerentes (`User`, `Cliente`, `Processo`) e relações. Criação em produção é apenas parcialmente evidenciada e não comprovada pelo repositório. |
| Arquivo exportado do Insomnia com as rotas organizadas | 1,5 | 0,0 | Arquivo exportado do Insomnia NÃO IDENTIFICADO. |
| Backend iniciado com integração ao banco usando Prisma ORM | 2,0 | 1,8 | Express configurado, rotas organizadas, controllers usando Prisma em operações reais e respostas JSON. Há inconsistência documental/log sobre SQLite vs MySQL. |
| Frontend iniciado em React, JavaScript e Tailwind | 1,5 | 1,2 | React/Vite/JavaScript implementados com telas e componentes; Tailwind tem configuração e dependência, mas uso/configuração efetiva está parcial. |
| Conexão inicial entre frontend e backend | 1,0 | 0,9 | Axios centralizado, endpoints compatíveis e token JWT no interceptor; funcionamento em execução depende de ambiente e banco configurados. |
| Clareza na apresentação e divisão de tarefas do grupo | 0,5 | NÃO VERIFICÁVEL | Histórico local mostra autores de commits, mas não comprova divisão de tarefas nem apresentação. |
| **Total verificável no repositório** | **10,0** | **6,6 + item não verificável** | Soma dos itens com nota numérica: 6,6. O critério de 0,5 sobre apresentação/divisão depende de verificação externa. |

### Observação sobre o total

- **Pontuação obtida nos itens verificáveis:** 6,6
- **Pontos dependentes de apresentação ou verificação externa:** 0,5
- **Nota máxima que pode ser confirmada apenas pelo repositório:** 9,5

O item não verificável não foi transformado automaticamente em zero. A decisão final sobre esse critério depende da apresentação ou de verificação externa pelo professor.

## 14. 📌 Síntese por critério

### 14.1 Organização do repositório e README — máximo 1,5

- **Situação:** Parcial
- **Evidências:** `README.md`, `README_COMPLETO.md`, estrutura `backend` e `frontend`.
- **Aspectos comprovados:** separação clara entre frontend e backend; documentação com instalação, execução e endpoints.
- **Aspectos ausentes:** README principal não acompanha totalmente o código atual; há referência a SQLite e fluxo antigo.
- **Aspectos não verificáveis:** professor como colaborador.
- **Nota sugerida:** 1,0/1,5

### 14.2 Banco de dados e coerência com o MVP — máximo 2,0

- **Situação:** Atende parcialmente
- **Evidências:** `backend/prisma/schema.prisma`, `backend/prisma/migrations/20260527110027_init/migration.sql`, `backend/.env.example`.
- **Models/tabelas principais:** usuários, clientes e processos.
- **Coerência com o MVP:** coerente com gestão jurídica, autenticação, clientes e processos.
- **Criação no servidor de produção:** Não comprovada pelo repositório.
- **Nota sugerida:** 1,7/2,0

### 14.3 Insomnia e organização das rotas — máximo 1,5

- **Situação:** Não atende
- **Evidências:** arquivo exportado do Insomnia NÃO IDENTIFICADO.
- **Organização das requisições:** NÃO IDENTIFICADO.
- **Compatibilidade com o backend:** NÃO IDENTIFICADO.
- **Nota sugerida:** 0,0/1,5

### 14.4 Backend com Prisma ORM — máximo 2,0

- **Situação:** Atende
- **Evidências:** `backend/server.js`, `backend/db.js`, `backend/routes`, `backend/controllers`, `backend/prisma/schema.prisma`.
- **Servidor Node.js/Express:** configurado em `backend/server.js`.
- **Prisma configurado:** schema, migration e configuração existem.
- **Operação no banco:** controllers executam CRUD, contagens e agrupamentos com Prisma.
- **Resposta em JSON:** presente nas rotas e controllers.
- **Nota sugerida:** 1,8/2,0

### 14.5 Frontend com React, JavaScript e Tailwind — máximo 1,5

- **Situação:** Parcial
- **Evidências:** `frontend/package.json`, `frontend/src/main.jsx`, `frontend/src/App.jsx`, `frontend/tailwind.config.js`, `frontend/postcss.config.js`.
- **React iniciado:** sim, com Vite.
- **JavaScript:** sim, arquivos `.js` e `.jsx`.
- **Tailwind:** configuração e dependência existem; uso efetivo é parcial.
- **Telas e componentes:** login, dashboard, processos, clientes, tabelas, formulários, sidebar e header.
- **Nota sugerida:** 1,2/1,5

### 14.6 Conexão frontend-backend — máximo 1,0

- **Situação:** Atende
- **Evidências:** `frontend/src/api.js`, `frontend/src/components/LoginForm.jsx`, `frontend/src/pages/Dashboard.jsx`, `frontend/src/components/ProcessosTable.jsx`, `frontend/src/components/ClienteForm.jsx`, `backend/routes`.
- **Fluxo identificado:** frontend chama API REST por Axios, envia JWT, backend valida token e responde JSON.
- **Compatibilidade das rotas e dados:** compatível para login, clientes, processos e dashboard.
- **Nota sugerida:** 0,9/1,0

### 14.7 Apresentação e divisão de tarefas — máximo 0,5

- **Situação:** Parcialmente comprovável
- **Evidências no repositório:** histórico local de commits com mais de um autor; README cita orientador.
- **O que precisa ser verificado na apresentação:** divisão real de responsabilidades, participação dos integrantes e demonstração oral.
- **Nota sugerida:** A DEFINIR/0,5

## 15. 🔍 Pontos para verificação durante a apresentação

- Verificar se o backend sobe corretamente com a configuração MySQL atual e com as variáveis de ambiente disponíveis.
- Verificar se o Prisma Client utilizado pelo backend está gerado e compatível com o schema e a configuração do projeto.
- Verificar se o banco de produção foi realmente criado e contém as tabelas geradas pela migration.
- Verificar o fluxo completo de login, armazenamento do token e acesso às rotas protegidas.
- Verificar se o cadastro de cliente permite criar processo com `clienteId` válido.
- Verificar se o dashboard mostra métricas reais após criação de clientes e processos.
- Solicitar o arquivo exportado do Insomnia, pois ele não foi encontrado no repositório.
- Verificar a participação dos integrantes e a divisão de tarefas, pois o histórico local não comprova completamente esse item.
- Verificar por que a documentação principal indica SQLite enquanto o schema e a configuração atuais indicam MySQL.
- Verificar se o seed mencionado na documentação existe fora do repositório ou se a documentação ficou desatualizada.

## 16. 📋 Conclusão

O projeto apresenta uma estrutura inicial sólida para a etapa de AV2: há separação entre frontend e backend, API Express organizada por rotas e controllers, autenticação JWT, uso real de Prisma ORM, schema relacional coerente com o domínio jurídico e frontend React com telas de login, dashboard, clientes e processos.

As partes comprovadamente funcionais em código são os fluxos de autenticação, CRUD de clientes, CRUD de processos, métricas do dashboard e integração via Axios. O banco está modelado com Prisma e possui migration MySQL, mas a criação em servidor de produção não é verificável apenas pelo repositório.

Os principais pontos incompletos ou ausentes são o arquivo exportado do Insomnia, a inconsistência da documentação sobre SQLite/MySQL, a referência a seed não encontrado e a comprovação externa de apresentação, divisão de tarefas e professor como colaborador.

Com base apenas nas evidências disponíveis no repositório, a nota sugerida para os critérios verificáveis é **6,6/9,5**, com **0,5 ponto a definir** por apresentação/divisão de tarefas. Em escala total de 10, sem transformar o item não verificável em zero, o resultado registrado é **6,6 pontos comprovados pelo repositório + critério externo pendente**.
