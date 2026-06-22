# Frontend LexFlow

Este diretório contém a aplicação frontend do LexFlow, construída com React, Vite e Tailwind CSS.

## ✅ Objetivo

Fornecer a interface de usuário para cadastro e gestão de clientes e processos jurídicos, consumindo a API backend do LexFlow.

## 🛠️ Tecnologias

- React
- Vite
- Tailwind CSS
- Axios
- JavaScript

## 🚀 Como rodar localmente

### 1. Instalar dependências

```bash
cd frontend
npm install
```

### 2. Configurar variáveis de ambiente

Copie o arquivo de exemplo:

```bash
cd frontend
cp .env.example .env
```

O arquivo `.env` deve conter:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### 3. Iniciar o frontend

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`.

## 🔌 Dependência do backend

O frontend consome a API em `http://localhost:5000/api`.

Garanta que o backend esteja rodando antes de abrir o frontend.

## 📁 Estrutura principal

- `src/App.jsx` — componente principal e navegação entre páginas
- `src/api.js` — cliente Axios configurado para a API
- `src/components/` — componentes reutilizáveis
- `src/pages/` — páginas da aplicação
- `src/styles/` — estilos globais e de layout

## 📌 Observações

- O login/logout usa token JWT salvo no `localStorage`
- O frontend já está preparado para consumir as rotas de autenticação, clientes, processos e dashboard
- Tailwind CSS é usado para estilização básica da interface
