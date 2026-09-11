# Correção de rumo: roteamento e integração com o backend

## Resumo

Transformar o frontend em uma aplicação com rotas reais, landing page pública e área interna protegida. O dashboard somente será carregado após validação do JWT. O cadastro público será removido e substituído por uma gestão de usuários exclusiva para administradores.

Rotas definidas:

| Rota | Acesso | Comportamento |
|---|---|---|
| `/` | Público | Landing simples; usuário autenticado é redirecionado ao dashboard |
| `/login` | Público | Login; após sucesso vai ao destino original ou `/dashboard` |
| `/dashboard` | Autenticado | Métricas do usuário |
| `/clientes` | Autenticado | Gestão de clientes |
| `/processos` | Autenticado | Gestão de processos |
| `/configuracoes` | Autenticado | Mantém o módulo atual até implementação posterior |
| `/usuarios` | Somente admin | Listagem, cadastro, edição e ativação/inativação |
| `*` | Público | Página 404 com ação adequada ao estado da sessão |

## Mudanças de implementação

### Roteamento e sessão

- Adicionar `react-router-dom` com `BrowserRouter`, `Routes`, `NavLink`, `Navigate` e carregamento sob demanda das páginas.
- Substituir `activeSection` do `App` por dois layouts: público e autenticado.
- Criar `AuthProvider` para armazenar token, usuário, estado de inicialização, login e logout.
- Ao iniciar, validar a sessão por `GET /api/auth/profile`; token ausente, inválido, expirado ou usuário inativo limpa o armazenamento e abre o login.
- Rotas protegidas aguardam a validação da sessão antes de renderizar, evitando exibição momentânea do dashboard.
- Acesso anônimo a uma rota privada redireciona para `/login?redirect=<rota>`; após login, retorna ao destino solicitado.
- Usuário sem perfil `admin` não acessa `/usuarios`, recebe resposta visual de acesso negado e retorna ao dashboard.
- Logout limpa a sessão e redireciona para `/login`.
- Configurar o servidor de hospedagem para devolver `index.html` em rotas do frontend.

### Autenticação e usuários

- Remover o cadastro do formulário de login e descontinuar `POST /api/auth/register`.
- Proteger todas as rotas `/api/users` com autenticação e middleware `authorizeRoles("admin")`.
- A página `/usuarios` consumirá:
  - `GET /api/users`;
  - `POST /api/users` com `nome`, `email`, `password` e `perfil`;
  - `PUT /api/users/:id` para nome, email, perfil e senha opcional;
  - `PATCH /api/users/:id/status` com `{ "ativo": boolean }`.
- Não disponibilizar exclusão permanente de usuários. A retirada de acesso será feita por inativação para preservar clientes e processos.
- Impedir que o administrador inative a própria conta ou remova o perfil do último administrador ativo.
- Validar `perfil` como `admin`, `advogado` ou `usuario`.
- Alterar o usuário do seed para `admin`, garantindo uma conta administrativa inicial.
- O login deve rejeitar usuários inativos; o middleware deve verificar no banco se o usuário do token ainda existe e está ativo.
- Remover o acesso automático pelo usuário seed quando não houver token, exigir `JWT_SECRET` e reservar `401` para sessão inválida e `403` para falta de permissão.
- Restringir CORS às origens configuradas por variável de ambiente.
- O interceptor Axios deve encerrar a sessão somente em `401`; respostas `403` devem preservar a sessão e mostrar falta de permissão.

### Contratos de clientes, processos e dashboard

- Na atualização de processo, aceitar `clienteId`, validar que o cliente pertence ao usuário autenticado e persistir a nova associação.
- Centralizar e validar os valores de processo:
  - status: `ativo`, `aguardando`, `concluído`, `suspenso`;
  - prioridade: `baixa`, `normal`, `alta`.
- Adotar `YYYY-MM-DD` como contrato público para `prazo`, armazenando-o como data sem horário e usando uma função única de serialização para evitar mudança de dia no fuso de São Paulo.
- Permitir limpar campos opcionais usando verificações por `undefined`, sem converter string vazia automaticamente no valor anterior.
- Trocar a unicidade global de CPF/CNPJ por `userId + cpfCnpj`.
- Impedir exclusão de cliente com processos vinculados, retornando `409`, e remover o cascade destrutivo dessa relação.
- No dashboard, calcular separadamente a contagem total de próximos vencimentos; a lista pode continuar limitada a seis itens.
- Remover `ProcessosFetch`, a exibição de JSON bruto e a chamada duplicada sem Axios.
- Excluir a implementação antiga e não utilizada de processos para eliminar a divergência de status.
- Manter busca, notificações e implementação completa de configurações fora desta etapa.

## Alterações de interfaces públicas

- `POST /api/auth/register`: removido.
- `GET /api/auth/profile`: passa a ser a fonte de verdade para restaurar a sessão.
- `PUT /api/processos/:id`: passa a atualizar também `clienteId`.
- Campos `prazo` nas requisições e respostas: normalizados como `YYYY-MM-DD`.
- `DELETE /api/users/:id`: removido do fluxo.
- `PATCH /api/users/:id/status`: novo endpoint administrativo.
- Rotas `/api/users/*`: retornam `403` para usuário autenticado não administrador.
- Exclusão de cliente vinculado: retorna `409` com mensagem utilizável pela interface.

As mudanças de banco serão feitas por migrations Prisma para data civil, unicidade composta de CPF/CNPJ e restrição da exclusão de clientes.

## Testes e critérios de aceitação

- Testar rotas com React Testing Library/Vitest: landing, login, redirecionamento autenticado, restauração da rota original, acesso administrativo e 404.
- Testar sessão expirada, token corrompido, usuário inativo, `401`, `403` e logout.
- Testar autorização no backend: anônimo, usuário comum e admin em todos os endpoints de usuários.
- Testar que um admin não pode inativar a si próprio nem o último admin ativo.
- Testar CRUD de clientes e processos, mudança do cliente de um processo e mensagens de validação do backend.
- Confirmar que um prazo mantém o mesmo dia ao criar, listar, editar e exibir no dashboard em `America/Sao_Paulo`.
- Confirmar que clientes vinculados não são excluídos e que usuários inativados preservam seus dados.
- Confirmar contagem correta de mais de seis vencimentos próximos.
- Executar migrations em banco de teste, build de produção e teste manual de atualização direta em todas as URLs privadas.

## Premissas e implantação

- A landing será simples, sem consumo do backend, com apresentação breve e CTA para `/login`.
- Usuários autenticados que acessarem `/` serão enviados a `/dashboard`.
- Apenas `admin` gerencia usuários; `advogado` e `usuario` acessam os módulos operacionais.
- A hospedagem suportará fallback de SPA para uso do `BrowserRouter`.
- Backend, migration e frontend devem ser publicados de forma coordenada; o backend compatível entra primeiro, seguido imediatamente pelo frontend.
- Antes da migration, será feito backup do banco e o seed será executado para promover a conta administrativa inicial.
