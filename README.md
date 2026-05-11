# LexFlow - Sistema de Gestão Jurídica

Um sistema completo de gestão de processos jurídicos desenvolvido como projeto de TCC, utilizando stack moderna e acessível.

## 📋 Visão Geral

O LexFlow é uma aplicação SaaS para gestão de processos jurídicos, oferecendo CRUD completo de processos com campos essenciais como título, área jurídica, prazo e status.

## 🛠️ Stack Tecnológica

- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Banco de Dados**: SQLite + Prisma ORM
- **Comunicação**: REST API

## 📁 Estrutura do Projeto

```
lexflow-tcc/
│
├── backend/
│   ├── server.js          # Servidor principal
│   ├── db.js              # Conexão e inicialização do banco
│   ├── routes/
│   │   └── processos.js   # Rotas da API para processos
│   ├── prisma/
│   │   └── schema.prisma  # Schema do banco de dados
│   ├── .env               # Variáveis de ambiente
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx        # Componente principal React
│   │   ├── api.js         # Cliente para comunicação com API
│   │   ├── components/
│   │   │   └── Processos.jsx  # Componente de gestão de processos
│   │   └── App.css        # Estilos da aplicação
│   └── package.json
│
└── README.md
```

## 🚀 Instalação e Execução

### Pré-requisitos

- Node.js (versão 16 ou superior)
- npm ou yarn

### 1. Backend Setup

```bash
# Navegar para o diretório backend
cd backend

# Instalar dependências
npm install

# Configurar o banco de dados
npx prisma generate
npx prisma db push

# Iniciar o servidor em modo desenvolvimento
npm run dev
```

O backend estará rodando em: `http://localhost:5000`

### 2. Frontend Setup

```bash
# Em outro terminal, navegar para o diretório frontend
cd frontend

# Instalar dependências
npm install

# Iniciar o servidor de desenvolvimento
npm run dev
```

O frontend estará rodando em: `http://localhost:5173`

## 🧪 Testes e Validação

### 1. Verificar Backend

Abra o navegador e acesse: `http://localhost:5000/api/health`

**Resposta esperada:**
```json
{
  "status": "OK",
  "message": "LexFlow API is running"
}
```

### 2. Verificar Frontend

Abra: `http://localhost:5173/`

Deve carregar a interface do LexFlow com a tabela de processos vazia.

### 3. Testar CRUD

#### Criar Processo:
1. Clique em "+ Novo Processo"
2. Preencha os campos:
   - Título: "Processo Teste 1"
   - Área: "Direito Civil"
   - Prazo: Selecione uma data futura
   - Status: "Ativo"
3. Clique em "Criar"

#### Listar Processos:
- O processo deve aparecer na tabela

#### Editar Processo:
1. Clique em "Editar" no processo
2. Altere algum campo (ex: título para "Processo Teste 1 - Editado")
3. Clique em "Atualizar"

#### Excluir Processo:
1. Clique em "Excluir" no processo
2. Confirme a exclusão

#### Persistência:
1. Pare o backend (Ctrl+C)
2. Reinicie o backend
3. Verifique se os dados persistem no SQLite

## 📊 Funcionalidades

### ✅ Módulo de Processos Jurídicos

- **Criar Processo**: Adicionar novo processo com título, área jurídica, prazo e status
- **Listar Processos**: Visualizar todos os processos em tabela organizada
- **Editar Processo**: Atualizar informações de processos existentes
- **Excluir Processo**: Remover processos com confirmação

### 📋 Campos do Processo

- **Título**: Nome/identificação do processo (obrigatório)
- **Área Jurídica**: Especialidade do direito (Civil, Penal, Trabalhista, etc.)
- **Prazo**: Data limite para conclusão (obrigatório)
- **Status**: Estado atual (Ativo, Pausado, Inativo)

## 🔧 API Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/processos` | Listar todos os processos |
| POST | `/api/processos` | Criar novo processo |
| PUT | `/api/processos/:id` | Atualizar processo existente |
| DELETE | `/api/processos/:id` | Excluir processo |
| GET | `/api/health` | Health check da API |

## 🐛 Possíveis Problemas e Soluções

### Erro: "Prisma client did not initialize"
**Solução:** Execute `npx prisma generate` no diretório backend

### Erro: "Database connection failed"
**Solução:** Verifique se o arquivo `dev.db` foi criado em `backend/`

### Erro: "CORS error" no frontend
**Solução:** Certifique-se que o backend está rodando na porta 5000

### Frontend não carrega
**Solução:** Verifique se as dependências foram instaladas corretamente

## 🎯 Próximos Passos para Evolução (SaaS)

### Fase 1: Autenticação e Usuários
- Sistema de login/registro
- Controle de acesso por usuário
- Perfis de usuário (Advogado, Cliente)

### Fase 2: Gestão de Clientes
- CRUD de clientes
- Vinculação cliente-processo
- Histórico de interações

### Fase 3: Dashboard e Relatórios
- Dashboard com métricas
- Gráficos de performance
- Relatórios exportáveis

### Fase 4: Notificações e Alertas
- Alertas de prazos próximos
- Notificações por email
- Lembretes automáticos

### Fase 5: Funcionalidades Avançadas
- Upload de documentos
- Controle de versões
- Integração com tribunais
- API para integração externa

## � Evidências para TCC

Para documentação do TCC, salve os seguintes prints/registros:

1. **Estrutura do projeto** (VS Code file explorer)
2. **Schema Prisma** (schema.prisma)
3. **Interface inicial** (tela vazia)
4. **Criação de processo** (formulário preenchido)
5. **Lista de processos** (tabela com dados)
6. **Edição de processo** (formulário de edição)
7. **Confirmação de exclusão** (modal/popup)
8. **Banco de dados** (arquivo dev.db no explorer)
9. **Terminal backend** (logs de inicialização)
10. **Terminal frontend** (logs do Vite)
11. **API health check** (navegador)
12. **Network tab** (Chrome DevTools - requests API)

## �📚 Considerações Técnicas

### Banco de Dados
- SQLite para simplicidade e portabilidade
- Prisma ORM para type safety e migrations
- Estrutura preparada para migração futura para PostgreSQL/MySQL

### Arquitetura
- Separação clara entre frontend e backend
- API RESTful bem documentada
- Código organizado e comentado
- Pronto para escalabilidade

### Desenvolvimento
- Hot reload em desenvolvimento
- Estrutura modular e reutilizável
- Validação de dados no backend
- Tratamento de erros consistente

## 🎓 TCC - Aspectos Acadêmicos

Este projeto foi desenvolvido como Trabalho de Conclusão de Curso, demonstrando:

- Aplicação prática de conceitos de Engenharia de Software
- Desenvolvimento full-stack com tecnologias modernas
- Arquitetura de software escalável
- Boas práticas de desenvolvimento
- Documentação técnica completa

## 📄 Licença

ISC

## 👥 Autor

[Seu Nome] - TCC [Nome da Instituição] - [Ano]
