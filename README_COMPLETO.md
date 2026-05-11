# LexFlow - Sistema de Gestão de Processos Jurídicos

Sistema SaaS completo para gerenciamento de processos jurídicos, clientes e tarefas. Desenvolvido com Node.js, Express, Prisma e React com Vite.

## 📋 Sumário

- [Características](#características)
- [Tecnologias](#tecnologias)
- [Instalação](#instalação)
- [Execução](#execução)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [API Endpoints](#api-endpoints)
- [Credenciais de Teste](#credenciais-de-teste)

## ✨ Características

### Backend
- ✅ Autenticação com JWT
- ✅ CRUD completo de Processos
- ✅ CRUD completo de Clientes
- ✅ Dashboard com métricas
- ✅ Banco de dados SQLite com Prisma
- ✅ Validação de dados
- ✅ Hash de senha com bcryptjs

### Frontend
- ✅ Interface responsiva com Tailwind CSS
- ✅ Componentes reutilizáveis
- ✅ Autenticação e gerenciamento de sessão
- ✅ CRUD de Processos e Clientes
- ✅ Dashboard com gráficos
- ✅ Integração com API backend

## 🛠️ Tecnologias

### Backend
- Node.js
- Express.js
- Prisma ORM
- SQLite
- JWT (jsonwebtoken)
- bcryptjs
- CORS

### Frontend
- React 18
- Vite
- Tailwind CSS
- Axios
- Lucide React (ícones)
- Framer Motion (animações)

## 📦 Instalação

### Backend

```bash
cd backend
npm install
```

Criar arquivo `.env`:
```
PORT=5000
DATABASE_URL="file:./dev.db"
JWT_SECRET=sua_chave_secreta_aqui
```

### Frontend

```bash
cd frontend
npm install
```

## 🚀 Execução

### Backend (Desenvolvimento)

```bash
cd backend
npm run dev
```

O servidor estará disponível em `http://localhost:5000`

### Backend (Produção)

```bash
cd backend
npm run start
```

### Frontend (Desenvolvimento)

```bash
cd frontend
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`

## 📁 Estrutura do Projeto

```
LexFlow/
├── backend/
│   ├── controllers/          # Controladores da aplicação
│   │   ├── authController.js
│   │   ├── clienteController.js
│   │   ├── processoController.js
│   │   └── dashboardController.js
│   ├── middleware/           # Middlewares
│   │   └── auth.js          # Autenticação JWT
│   ├── services/            # Serviços de lógica de negócio
│   │   └── authService.js
│   ├── routes/              # Rotas da API
│   │   ├── auth.js
│   │   ├── processos.js
│   │   ├── clientes.js
│   │   └── dashboard.js
│   ├── prisma/              # Configuração Prisma
│   │   ├── schema.prisma    # Schema do banco de dados
│   │   └── seed.js          # Dados iniciais
│   ├── db.js                # Conexão com BD
│   ├── server.js            # Servidor principal
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Componentes React
│   │   │   ├── Button.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── LoginForm.jsx
│   │   │   ├── ProcessosTable.jsx
│   │   │   ├── ProcessoForm.jsx
│   │   │   ├── ClientesTable.jsx
│   │   │   └── ClienteForm.jsx
│   │   ├── pages/           # Páginas
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Processos.jsx
│   │   │   └── Clientes.jsx
│   │   ├── styles/          # Estilos CSS
│   │   │   ├── globals.css
│   │   │   ├── dashboard.css
│   │   │   └── auth.css
│   │   ├── api.js           # Cliente HTTP (Axios)
│   │   ├── App.jsx          # Componente principal
│   │   └── main.jsx         # Entry point
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
└── README.md
```

## 📡 API Endpoints

### Autenticação

- `POST /api/auth/register` - Registrar novo usuário
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Obter perfil (requer auth)

### Processos

- `GET /api/processos` - Listar processos (requer auth)
- `GET /api/processos/:id` - Obter processo (requer auth)
- `POST /api/processos` - Criar processo (requer auth)
- `PUT /api/processos/:id` - Atualizar processo (requer auth)
- `DELETE /api/processos/:id` - Deletar processo (requer auth)

### Clientes

- `GET /api/clientes` - Listar clientes (requer auth)
- `GET /api/clientes/:id` - Obter cliente (requer auth)
- `POST /api/clientes` - Criar cliente (requer auth)
- `PUT /api/clientes/:id` - Atualizar cliente (requer auth)
- `DELETE /api/clientes/:id` - Deletar cliente (requer auth)

### Dashboard

- `GET /api/dashboard/metrics` - Obter métricas (requer auth)

## 🔑 Credenciais de Teste

Após executar o seed, use as seguintes credenciais para login:

```
Email: advogado@lexflow.com
Senha: 123456
```

## 🗄️ Banco de Dados

### Schema

#### Users
- `id` - ID único
- `email` - Email único
- `password` - Senha (hash)
- `nome` - Nome completo
- `perfil` - Tipo de usuário (admin, advogado, usuario)
- `ativo` - Status do usuário

#### Clientes
- `id` - ID único
- `nome` - Nome do cliente
- `cpfCnpj` - CPF ou CNPJ (único)
- `email` - Email
- `telefone` - Telefone
- `endereco` - Endereço completo
- `cidade` - Cidade
- `estado` - Estado
- `cep` - CEP
- `observacoes` - Notas
- `userId` - ID do usuário (relacionamento)

#### Processos
- `id` - ID único
- `titulo` - Título do processo
- `area` - Área jurídica (Civil, Trabalhista, Penal, etc)
- `prazo` - Data de prazo
- `status` - Status (ativo, aguardando, concluído, suspenso)
- `descricao` - Descrição detalhada
- `prioridade` - Prioridade (baixa, normal, alta)
- `userId` - ID do usuário (relacionamento)
- `clienteId` - ID do cliente (relacionamento)

## 🔐 Segurança

- Senhas são hasheadas com bcryptjs
- JWT para autenticação
- Validação de entrada em todos os endpoints
- Isolamento de dados por usuário
- CORS configurado

## 📝 Scripts Disponíveis

### Backend

```bash
npm run dev           # Iniciar em modo desenvolvimento
npm run start         # Iniciar em produção
npm run seed          # Popular banco de dados
npm run migrate       # Executar migrations
npm run migrate:reset # Resetar banco de dados
```

### Frontend

```bash
npm run dev           # Iniciar em modo desenvolvimento
npm run build         # Build para produção
npm run preview       # Visualizar build de produção
```

## 🐛 Troubleshooting

### Porta 5000 em uso
```bash
# Mude a porta no arquivo .env do backend
PORT=5001
```

### Erro de banco de dados
```bash
# Resetar o banco de dados
cd backend
npm run migrate:reset
npm run seed
```

### Erro de CORS
Certifique-se que o backend está rodando e o frontend está usando a URL correta do backend.

## 👥 Colaboradores

- Orientador: h-fcosta

## 📄 Licença

Este projeto é parte de um TCC (Trabalho de Conclusão de Curso).

## 📞 Suporte

Para questões e suporte, entre em contato com a equipe de desenvolvimento.
