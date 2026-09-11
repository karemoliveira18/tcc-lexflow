# Relatório de análise do backend — LexFlow

**Data da análise:** 11/09/2026  
**Escopo:** estrutura do backend, persistência, autenticação e, principalmente, rotas HTTP já implementadas.

## 1. Resumo executivo

O backend do LexFlow já contém uma API REST organizada em rotas, controllers, middleware e serviço de autenticação. A aplicação usa **Node.js com Express**, **Prisma ORM**, **MySQL**, **JWT** e **bcrypt**.

Foram identificados **20 endpoints**:

- 3 de autenticação;
- 5 de usuários;
- 5 de clientes;
- 5 de processos;
- 1 de dashboard;
- 1 de verificação de saúde da API.

Os CRUDs principais de usuários, clientes e processos estão implementados. Clientes e processos possuem isolamento por usuário autenticado, e o dashboard calcula indicadores a partir desses dados. A autenticação gera tokens com validade de sete dias e as senhas são armazenadas com hash bcrypt.

Apesar de a base funcional estar pronta, há pontos que impedem considerar o backend pronto para produção: o modo de desenvolvimento permite acesso sem token, não há autorização por perfil nas rotas administrativas, o cadastro público aceita o perfil enviado pelo cliente, as validações são básicas, não existem testes automatizados e os erros internos são devolvidos diretamente ao consumidor.

Na verificação realizada, a sintaxe dos arquivos JavaScript e o schema Prisma foram validados com sucesso. A aplicação não pôde ser testada por HTTP porque a conexão com o MySQL configurado retornou o erro Prisma `P1001` (servidor de banco inacessível no ambiente da análise).

## 2. Tecnologias e organização

| Componente | Implementação atual |
|---|---|
| Runtime | Node.js com módulos ES (`type: module`) |
| API HTTP | Express 4 |
| Banco de dados | MySQL |
| ORM | Prisma Client 6.19.3 |
| Autenticação | JWT (`jsonwebtoken`) |
| Senhas | bcrypt (`bcryptjs`), custo 10 |
| CORS | Habilitado globalmente com configuração padrão |
| Configuração | Variáveis de ambiente via `dotenv` |
| Desenvolvimento | `nodemon` por meio de `npm run dev` |

Estrutura principal:

```text
backend/
├── controllers/    # Regras HTTP e chamadas ao Prisma
├── middleware/     # Autenticação JWT e fallback de desenvolvimento
├── prisma/         # Schema, migration inicial e seed
├── routes/         # Declaração dos endpoints Express
├── services/       # Hash, comparação de senha e emissão de JWT
├── db.js           # Instância e conexão do Prisma
└── server.js       # Configuração e inicialização da API
```

O `server.js` registra `cors()`, leitura de JSON e os cinco roteadores sob o prefixo `/api`. A API só começa a escutar a porta depois que o Prisma consegue se conectar ao banco.

## 3. Modelo de dados

### User

Representa o usuário do sistema. Possui `id`, `email` único, senha com hash, nome, perfil, indicador de atividade e datas de criação/atualização. Relaciona-se com vários clientes e processos.

Perfis documentados no schema: `admin`, `advogado` e `usuario`. Atualmente são strings livres e não há enum nem autorização baseada nesses valores.

### Cliente

Armazena nome, CPF/CNPJ único, contatos, endereço, observações, estado ativo e datas. Todo cliente pertence a um usuário.

O `cpfCnpj` é único em toda a base, e não apenas dentro da conta de um usuário. Assim, dois usuários diferentes não podem cadastrar o mesmo cliente.

### Processo

Armazena título, área, prazo, status, descrição, prioridade e datas. Todo processo pertence simultaneamente a um usuário e a um cliente.

Status documentados: `ativo`, `aguardando`, `concluído` e `suspenso`. Prioridades documentadas: `baixa`, `normal` e `alta`. Como ambos são strings livres, a API aceita outros valores.

### Exclusões em cascata

- Excluir um usuário exclui seus clientes e processos.
- Excluir um cliente exclui os processos vinculados a ele.

Esse comportamento está configurado nas chaves estrangeiras com `onDelete: Cascade` e merece confirmação explícita na interface antes de exclusões.

## 4. Autenticação aplicada às rotas

O cliente deve normalmente enviar:

```http
Authorization: Bearer <token-jwt>
```

O token contém `userId`, `email` e `perfil`, usa `JWT_SECRET` e expira em sete dias. Um token ausente gera `401`; token inválido ou expirado gera `403`.

Entretanto, há um **fallback de desenvolvimento**: quando nenhum token é enviado, o middleware procura no banco o usuário definido em `DEV_USER_EMAIL`, ou `admin@lexflow.com` por padrão, e autentica a requisição como esse usuário. Na prática, se o usuário seed existir, todas as rotas marcadas como protegidas podem ser acessadas sem token. O código comenta que esse comportamento é voltado à AV2, mas ele não está condicionado a `NODE_ENV=development`.

### Matriz de acesso atual

| Grupo | Sem token | Com token válido | Restrição por perfil |
|---|---:|---:|---:|
| Registro e login | Sim | Sim | Não |
| Health check | Sim | Sim | Não |
| Perfil | Sim, se o fallback encontrar o seed | Sim | Não |
| Usuários | Sim, se o fallback encontrar o seed | Sim | Não |
| Clientes | Sim, se o fallback encontrar o seed | Sim | Não |
| Processos | Sim, se o fallback encontrar o seed | Sim | Não |
| Dashboard | Sim, se o fallback encontrar o seed | Sim | Não |

## 5. Catálogo detalhado das rotas prontas

### 5.1 Infraestrutura

#### `GET /api/health`

Endpoint público que confirma que o processo HTTP está ativo.

Resposta `200`:

```json
{
  "status": "OK",
  "message": "LexFlow API is running"
}
```

Observação: como o servidor só começa a escutar depois de conectar ao banco, essa rota também indica indiretamente que a conexão inicial com o banco funcionou. Ela não executa, porém, uma consulta ao banco a cada chamada.

### 5.2 Autenticação — `/api/auth`

#### `POST /api/auth/register`

Cria um usuário, aplica hash à senha e já devolve um JWT.

Corpo esperado:

```json
{
  "email": "usuario@exemplo.com",
  "password": "Senha123!",
  "nome": "Nome do usuário",
  "perfil": "usuario"
}
```

- Obrigatórios: `email`, `password`, `nome`.
- Opcional: `perfil`; o padrão é `usuario`.
- `201`: usuário criado, token e dados públicos do usuário.
- `400`: campo obrigatório ausente.
- `409`: e-mail já cadastrado.
- `500`: erro interno.

Ponto crítico: a rota é pública e aceita qualquer valor de `perfil`, inclusive `admin`. Isso permite elevação de privilégio caso futuras regras confiem nesse campo.

#### `POST /api/auth/login`

Valida e-mail e senha usando bcrypt e emite um JWT válido por sete dias.

Corpo esperado:

```json
{
  "email": "usuario@exemplo.com",
  "password": "Senha123!"
}
```

- `200`: mensagem de sucesso, token e dados públicos do usuário.
- `400`: e-mail ou senha ausente.
- `401`: usuário inexistente ou senha incorreta.
- `500`: erro interno.

Observação: o campo `ativo` não é verificado. Um usuário inativo continua conseguindo fazer login e acessar a API.

#### `GET /api/auth/profile`

Retorna o usuário identificado pelo `userId` do token, sem expor a senha.

- Proteção: middleware de autenticação.
- `200`: `id`, `email`, `nome`, `perfil`, `ativo` e `createdAt`.
- `404`: usuário do token não existe mais.
- `500`: erro interno.

### 5.3 Usuários — `/api/users`

Todas as rotas deste grupo passam pelo middleware de autenticação, mas **qualquer usuário autenticado pode listar, criar, alterar e excluir qualquer usuário**. Não há verificação de perfil nem limitação ao próprio cadastro.

#### `GET /api/users`

Lista todos os usuários, ordenados do mais recente para o mais antigo. Não retorna senhas.

- `200`: array com `id`, `email`, `nome`, `perfil`, `ativo` e `createdAt`.
- `500`: erro interno.
- Sem paginação, filtros ou limite.

#### `GET /api/users/:id`

Busca um usuário pelo CUID.

- `200`: dados públicos do usuário.
- `404`: usuário não encontrado.
- `500`: erro interno.

#### `POST /api/users`

Cria um usuário e aplica hash à senha.

Corpo aceito: `email`, `password`, `nome` e `perfil`.

- Obrigatórios: `email`, `password`, `nome`.
- Perfil padrão: `usuario`.
- `201`: usuário criado, sem senha na resposta.
- `400`: campo obrigatório ausente.
- `409`: e-mail já registrado.
- `500`: erro interno.

#### `PUT /api/users/:id`

Atualiza parcialmente um usuário, apesar de usar o verbo `PUT`.

Campos aceitos: `email`, `password`, `nome`, `perfil` e `ativo`. A senha é reprocessada com bcrypt quando fornecida.

- `200`: usuário atualizado, sem senha.
- `404`: usuário não encontrado.
- `500`: erro interno, inclusive conflito de e-mail único.

#### `DELETE /api/users/:id`

Exclui definitivamente o usuário.

- `200`: mensagem de sucesso.
- `404`: usuário não encontrado.
- `500`: erro interno.

Por causa das relações em cascata, também pode excluir os clientes e processos desse usuário. A rota permite que o usuário autenticado exclua a própria conta ou qualquer outra.

### 5.4 Clientes — `/api/clientes`

Todas as rotas usam autenticação e isolam os registros pelo `userId` do token. Um usuário não consegue consultar, atualizar ou excluir diretamente clientes de outro usuário.

#### `GET /api/clientes`

Lista todos os clientes pertencentes ao usuário autenticado, inclusive inativos, do mais recente para o mais antigo.

- `200`: array de clientes completos.
- `500`: erro interno.
- Sem paginação, busca ou filtros.

#### `GET /api/clientes/:id`

Busca um cliente pelo ID, exigindo simultaneamente que pertença ao usuário autenticado.

- `200`: cliente completo.
- `404`: ID inexistente ou cliente pertencente a outro usuário.
- `500`: erro interno.

#### `POST /api/clientes`

Cria um cliente vinculado ao usuário autenticado.

Corpo aceito:

```json
{
  "nome": "Cliente Exemplo",
  "cpfCnpj": "00000000000",
  "email": "cliente@exemplo.com",
  "telefone": "(11) 90000-0000",
  "endereco": "Rua Exemplo, 100",
  "cidade": "São Paulo",
  "estado": "SP",
  "cep": "01000-000",
  "observacoes": "Texto livre"
}
```

- Obrigatórios: `nome` e `cpfCnpj`.
- `201`: cliente criado.
- `400`: campo obrigatório ausente.
- `409`: CPF/CNPJ já existente em toda a base.
- `500`: erro interno.

Não há validação de formato ou dígitos de CPF/CNPJ, e-mail, telefone, UF ou CEP.

#### `PUT /api/clientes/:id`

Atualiza parcialmente um cliente do usuário autenticado.

Campos aceitos: `nome`, `cpfCnpj`, `email`, `telefone`, `endereco`, `cidade`, `estado`, `cep`, `observacoes` e `ativo`.

- `200`: cliente atualizado.
- `404`: cliente inexistente ou de outro usuário.
- `409`: novo CPF/CNPJ já utilizado.
- `500`: erro interno.

Como a atualização usa expressões do tipo `email || undefined`, não é possível limpar campos textuais enviando string vazia ou `null`.

#### `DELETE /api/clientes/:id`

Exclui definitivamente um cliente do usuário autenticado.

- `200`: mensagem de sucesso.
- `404`: cliente inexistente ou de outro usuário.
- `500`: erro interno.

Todos os processos vinculados ao cliente também são excluídos por cascata.

### 5.5 Processos — `/api/processos`

Todas as rotas usam autenticação e restringem processos ao `userId` autenticado.

#### `GET /api/processos`

Lista os processos do usuário, do mais recente para o mais antigo. Cada item inclui um resumo do cliente: `id`, `nome` e `cpfCnpj`.

- `200`: array de processos.
- `500`: erro interno.
- Sem paginação, busca ou filtros por status, prioridade, área ou prazo.

#### `GET /api/processos/:id`

Busca um processo do usuário. Inclui dados do cliente: `id`, `nome`, `cpfCnpj`, `email` e `telefone`.

- `200`: processo e cliente relacionado.
- `404`: processo inexistente ou de outro usuário.
- `500`: erro interno.

#### `POST /api/processos`

Cria um processo vinculado ao usuário e a um cliente que também precisa pertencer a esse usuário.

Corpo aceito:

```json
{
  "titulo": "Processo Exemplo",
  "area": "Direito Civil",
  "prazo": "2026-10-01T12:00:00.000Z",
  "status": "ativo",
  "descricao": "Texto livre",
  "prioridade": "normal",
  "clienteId": "id-do-cliente"
}
```

- Obrigatórios: `titulo`, `area`, `prazo`, `clienteId`.
- Padrões: `status = ativo` e `prioridade = normal`.
- `201`: processo criado com resumo do cliente.
- `400`: campo obrigatório ausente.
- `404`: cliente não existe ou pertence a outro usuário.
- `500`: erro interno.

O prazo é convertido com `new Date(prazo)`, mas não há validação explícita de data inválida. Status e prioridade também não são validados contra os valores documentados.

#### `PUT /api/processos/:id`

Atualiza parcialmente um processo pertencente ao usuário.

Campos aceitos: `titulo`, `area`, `prazo`, `status`, `descricao` e `prioridade`.

- `200`: processo atualizado com resumo do cliente.
- `404`: processo inexistente ou de outro usuário.
- `500`: erro interno.

Não é possível trocar o `clienteId`. Assim como no cliente, não é possível limpar `descricao` com string vazia ou `null`.

#### `DELETE /api/processos/:id`

Exclui definitivamente um processo do usuário autenticado.

- `200`: mensagem de sucesso.
- `404`: processo inexistente ou de outro usuário.
- `500`: erro interno.

### 5.6 Dashboard — `/api/dashboard`

#### `GET /api/dashboard/metrics`

Agrega métricas dos clientes e processos do usuário autenticado.

Retorna:

- resumo com total de processos, clientes ativos, processos vencidos, ativos e concluídos;
- agrupamento de processos por status;
- agrupamento por prioridade;
- agrupamento por área;
- até seis processos não concluídos com prazo entre hoje e os próximos sete dias, ordenados pelo prazo.

Formato aproximado:

```json
{
  "resumo": {
    "totalProcessos": 10,
    "totalClientes": 5,
    "processosVencidos": 2,
    "processosAtivos": 8,
    "processosConcluidos": 2,
    "proximosVencimentosCount": 3
  },
  "processosPorStatus": [],
  "processosPorPrioridade": [],
  "processosPorArea": [],
  "proximosVencimentos": []
}
```

Detalhes importantes:

- `totalClientes` considera somente clientes com `ativo = true`.
- `totalProcessos` considera todos os processos.
- `processosAtivos` significa, no código, qualquer status diferente de `concluído`; portanto inclui aguardando, suspensos e até valores não padronizados.
- Vencidos são os não concluídos com prazo anterior ao início do dia atual.
- Próximos vencimentos incluem hoje e o instante correspondente ao início do sétimo dia.
- `proximosVencimentosCount` é o tamanho da lista limitada a seis, não a contagem real de todos os vencimentos no intervalo.
- O controller executa oito consultas ao banco em sequência, o que pode aumentar a latência.

## 6. Seed e dados iniciais

O comando `npm run seed` cria ou atualiza:

- usuário `admin@lexflow.com`, perfil `advogado` e senha definida no próprio script;
- um cliente de demonstração;
- um processo de demonstração com prazo quinze dias à frente da execução do seed.

O uso de `upsert` torna o seed repetível. Porém, a credencial conhecida no código não deve ser utilizada em produção.

## 7. O que foi validado nesta análise

| Verificação | Resultado |
|---|---|
| Leitura e cruzamento de rotas, controllers, middleware e schema | Concluído |
| Sintaxe dos arquivos JavaScript principais (`node --check`) | Válida |
| Schema Prisma (`npx prisma validate`) | Válido |
| Dependências instaladas (`npm ls --depth=0`) | Sem dependências ausentes |
| Inicialização do servidor | Bloqueada pela conexão MySQL (`P1001`) |
| Testes HTTP ponta a ponta | Não executados, pois o servidor não iniciou |
| Testes automatizados | Não há script ou suíte de testes no projeto |

O projeto contém a migration inicial das três tabelas e suas chaves estrangeiras. O arquivo `.env.example` documenta `DATABASE_URL` e `JWT_SECRET`.

## 8. Pontos positivos

- Separação clara entre rotas, controllers, middleware e serviço.
- Senhas não são devolvidas pelas rotas e são persistidas com bcrypt.
- JWT possui expiração definida.
- Clientes e processos são filtrados pelo usuário autenticado.
- Ao criar processo, é verificado se o cliente pertence ao mesmo usuário.
- E-mail de usuário e CPF/CNPJ possuem restrição única no banco.
- Relações e exclusões em cascata estão declaradas tanto no schema quanto na migration.
- Seed reproduzível para demonstração.
- Dashboard já entrega agregações úteis ao frontend.

## 9. Riscos e lacunas encontrados

### Prioridade crítica

1. **Autenticação sem token:** remover ou condicionar estritamente o fallback do usuário seed a um ambiente local controlado.
2. **Ausência de autorização:** limitar o CRUD global de usuários a administradores e definir o que cada perfil pode fazer.
3. **Elevação de privilégio no registro:** ignorar `perfil` no cadastro público e atribuir sempre um perfil seguro.
4. **Segredo JWT padrão:** falhar na inicialização se `JWT_SECRET` não estiver definido, em vez de usar `your_secret_key`.

### Prioridade alta

1. Bloquear login e acesso de usuários com `ativo = false`.
2. Validar payloads com uma biblioteca de schema, cobrindo e-mail, senha, CPF/CNPJ, datas, enums e tamanhos.
3. Não devolver `error.message` diretamente; registrar detalhes no servidor e retornar mensagens controladas.
4. Tratar erros Prisma de unicidade e integridade de forma consistente em todos os controllers.
5. Adicionar testes de integração para autenticação, isolamento entre usuários e exclusões em cascata.
6. Rever a exclusão física de usuário e cliente; uma desativação lógica pode ser mais segura para dados jurídicos.

### Prioridade média

1. Adicionar paginação, filtros e busca às listagens.
2. Padronizar os status HTTP e o formato de erros.
3. Usar `PATCH` para atualizações parciais ou exigir recurso completo em `PUT`.
4. Permitir limpar campos opcionais de forma explícita.
5. Corrigir a contagem de próximos vencimentos para não depender da lista limitada a seis.
6. Executar consultas independentes do dashboard em paralelo ou consolidá-las quando apropriado.
7. Restringir CORS às origens autorizadas.
8. Adicionar middleware global para rota inexistente (`404`) e tratamento centralizado de erros.
9. Adicionar encerramento gracioso do Prisma em `SIGINT`/`SIGTERM`.

### Manutenção

- `@prisma/adapter-mariadb` está instalado na versão 7.8.0, mas não é usado; o projeto instancia o Prisma Client diretamente e os demais pacotes Prisma estão na versão 6.19.3. Convém remover o adaptador ou alinhar versões se ele passar a ser usado.
- O comentário do schema menciona PostgreSQL, embora o datasource e o restante do projeto estejam configurados para MySQL.
- Não há documentação OpenAPI/Swagger, lint, formatter ou script de teste.

## 10. Avaliação do estado atual

O backend está em um estágio de **MVP funcional no código**: autenticação, usuários, clientes, processos e dashboard já possuem implementações coerentes para uma demonstração ou avaliação acadêmica. As rotas de domínio mais importantes estão completas em termos de CRUD, e o isolamento por usuário foi aplicado corretamente a clientes, processos e métricas.

Para homologação, o próximo passo é restabelecer a conexão com o MySQL, aplicar/verificar migrations e executar testes HTTP de todos os fluxos. Para produção, devem ser resolvidos antes os quatro riscos críticos de autenticação e autorização, seguidos por validação robusta, tratamento seguro de erros e testes automatizados.
