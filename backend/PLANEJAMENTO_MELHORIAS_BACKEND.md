# Planejamento de correções e evolução do backend LexFlow

## Resumo

Fortalecer segurança, validação, autorização, tratamento de erros e desempenho sem modificar o schema Prisma nem criar migrations.

Somente estas rotas serão públicas:

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`

Todas as demais rotas exigirão usuário autenticado e ativo. O CRUD de usuários exigirá adicionalmente o perfil `admin`.

## Etapa 1 — Configuração segura e autenticação

- Criar validação de ambiente executada antes da conexão com o banco.
- Exigir `DATABASE_URL`, `JWT_SECRET` e `CORS_ALLOWED_ORIGINS`; remover os valores secretos de fallback.
- Documentar as variáveis no `.env.example`, com origens separadas por vírgula.
- Remover completamente a autenticação automática pelo usuário seed.
- Validar estritamente o cabeçalho `Authorization: Bearer <token>`.
- Após validar o JWT, consultar o usuário no banco:
  - usuário inexistente, token inválido ou expirado: `401`;
  - usuário inativo: `401`;
  - usar o perfil atual do banco, não o perfil potencialmente desatualizado contido no token.
- No cadastro público, aceitar temporariamente o campo `perfil` para compatibilidade, mas ignorá-lo e sempre criar o usuário como `usuario`.
- Impedir login de usuários inativos.
- Tratar preflight `OPTIONS` pelo CORS sem considerá-lo uma rota pública de negócio.

## Etapa 2 — Autorização e proteção das rotas

Implementar middleware de autorização por perfil e aplicar esta matriz:

| Rotas | Acesso |
|---|---|
| Health, cadastro e login | Público |
| Perfil autenticado | Qualquer usuário ativo |
| Clientes | Qualquer usuário ativo, somente nos próprios registros |
| Processos | Qualquer usuário ativo, somente nos próprios registros |
| Dashboard | Qualquer usuário ativo, somente sobre os próprios dados |
| CRUD de usuários | Somente `admin` ativo |

Regras adicionais:

- Administradores não ganham acesso automático aos clientes e processos de outros usuários.
- Retornar `403 FORBIDDEN` quando um usuário autenticado não possuir o perfil exigido.
- Manter respostas `404` para recursos de outro proprietário, evitando revelar sua existência.
- Impedir que um administrador desative a própria conta pela sessão atual.
- Montar primeiro as três rotas públicas e aplicar autenticação globalmente ao restante de `/api`, inclusive rotas futuras.

## Etapa 3 — Validação e contrato padronizado

- Adicionar uma biblioteca de validação por schema, preferencialmente Zod.
- Criar middleware reutilizável para validar corpo, parâmetros e query string.
- Rejeitar campos obrigatórios vazios, tipos incorretos e propriedades não suportadas, exceto o `perfil` legado do cadastro, que será ignorado.
- Validar:
  - e-mails e tamanho máximo de 191 caracteres;
  - senha com mínimo de 8 caracteres;
  - nomes e títulos entre 2 e 191 caracteres;
  - CPF/CNPJ com 11 ou 14 dígitos e dígitos verificadores válidos, aceitando entrada formatada;
  - UF com duas letras e CEP brasileiro;
  - datas ISO válidas;
  - perfil em `admin`, `advogado` ou `usuario`;
  - status em `ativo`, `aguardando`, `concluído` ou `suspenso`;
  - prioridade em `baixa`, `normal` ou `alta`;
  - textos opcionais respeitando o limite atual de 191 caracteres do banco.
- Não modificar `schema.prisma`, migrations, tabelas ou índices.
- Padronizar erros como:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dados inválidos",
    "details": []
  }
}
```

- Usar códigos estáveis: `VALIDATION_ERROR`, `AUTH_REQUIRED`, `INVALID_TOKEN`, `ACCOUNT_INACTIVE`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT` e `INTERNAL_ERROR`.
- Mapear consistentemente:
  - validação: `400`;
  - autenticação: `401`;
  - autorização: `403`;
  - recurso inexistente: `404`;
  - unicidade, integridade ou operação incompatível: `409`;
  - falha inesperada: `500`.
- Registrar detalhes técnicos no servidor, mas nunca devolver `error.message`, stack trace ou detalhes do banco.
- Adicionar middleware global de erro e resposta `404` padronizada.

## Etapa 4 — Atualizações e exclusões seguras

- Adicionar `PATCH /api/users/:id`, `PATCH /api/clientes/:id` e `PATCH /api/processos/:id` como contratos oficiais para atualização parcial.
- Manter os endpoints `PUT` atuais temporariamente como aliases do mesmo comportamento, documentados como legados.
- Permitir `null` somente nos campos opcionais para que possam ser limpos, como telefone, endereço, observações e descrição.
- Rejeitar string vazia ou `null` em campos obrigatórios.
- Alterar exclusões sem modificar o banco:
  - `DELETE /api/users/:id`: definir `ativo = false`;
  - `DELETE /api/clientes/:id`: definir `ativo = false`;
  - `DELETE /api/processos/:id`: manter exclusão física, pois não existe campo apropriado para desativação.
- Tornar a desativação idempotente: excluir novamente um usuário ou cliente já inativo retorna sucesso.
- Permitir que administradores reativem usuários por `PATCH`.
- Permitir que o proprietário reative clientes por `PATCH`.
- Listagens de clientes retornam ativos por padrão, com filtro explícito para consultar inativos.
- Não permitir criar processo para cliente inativo.
- Preservar processos existentes quando um cliente for desativado, eliminando a exclusão em cascata no fluxo normal da API.

## Etapa 5 — Paginação, busca e filtros

Alterar as listagens para o envelope:

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 0,
    "totalPages": 0
  }
}
```

Regras comuns:

- `page` padrão `1`;
- `limit` padrão `20`, máximo `100`;
- ordenação padrão por `createdAt desc`;
- valores inválidos retornam `400`.

Filtros:

- `GET /api/users`: `search` em nome/e-mail, `perfil` e `ativo`.
- `GET /api/clientes`: `search` em nome/CPF-CNPJ/e-mail e `ativo`, sendo `ativo=true` o padrão.
- `GET /api/processos`: `search` no título, `status`, `prioridade`, `area`, `clienteId`, `prazoDe` e `prazoAte`.

Essa alteração quebra consumidores que esperam arrays diretamente. O frontend deverá passar a ler `response.data.data`; sua implementação não faz parte deste plano de backend.

## Etapa 6 — Dashboard e desempenho

- Executar consultas independentes do dashboard com `Promise.all`.
- Criar uma consulta de contagem própria para próximos vencimentos.
- Manter a lista visual limitada a seis registros, mas fazer `proximosVencimentosCount` representar o total real.
- Definir “próximos sete dias” como hoje até o final do sétimo dia, usando limite superior exclusivo para evitar perda de registros.
- Manter vencidos como processos não concluídos com prazo anterior ao início do dia atual.
- Renomear ou documentar `processosAtivos` como total de processos não concluídos; manter o campo atual para compatibilidade.
- Garantir que todas as métricas permaneçam isoladas pelo `userId`.

## Etapa 7 — CORS e ciclo de vida

- Permitir apenas origens presentes em `CORS_ALLOWED_ORIGINS`.
- Permitir chamadas sem `Origin`, como testes e integrações servidor-servidor.
- Responder origem não autorizada com erro controlado.
- Exportar a aplicação Express separadamente da inicialização do servidor para facilitar testes.
- Implementar encerramento gracioso em `SIGINT` e `SIGTERM`:
  - parar de aceitar novas conexões;
  - aguardar requisições em andamento;
  - executar `prisma.$disconnect()`;
  - encerrar com código apropriado.

## Etapa 8 — Testes e critérios de aceite

Adicionar testes unitários e de integração com banco exclusivo de testes, sem tocar no banco de desenvolvimento ou produção.

Cenários obrigatórios:

- Apenas health, cadastro e login funcionam sem token.
- Todas as outras rotas retornam `401` sem token.
- Token inválido ou expirado retorna `401`.
- Usuário inativo não faz login nem reutiliza token antigo.
- Cadastro público sempre cria perfil `usuario`.
- Somente admin acessa o CRUD de usuários.
- Usuário não acessa clientes, processos ou métricas de outro usuário.
- Payloads inválidos retornam `400` no formato padronizado.
- Conflitos de e-mail e CPF/CNPJ retornam `409`.
- Campos opcionais são limpos com `null`.
- `PATCH` e o alias legado `PUT` produzem o mesmo resultado.
- Exclusão de usuário e cliente apenas os desativa e preserva registros relacionados.
- Exclusão de processo continua física e limitada ao proprietário.
- Paginação, limites, busca e filtros retornam totais corretos.
- A contagem de próximos vencimentos pode ser maior que a lista de seis itens.
- Origens CORS autorizadas são aceitas e origens não autorizadas são bloqueadas.
- Erros inesperados não expõem mensagens internas.
- Rota inexistente retorna `404` padronizado.

Comandos de validação a disponibilizar:

- teste unitário;
- teste de integração;
- validação do Prisma;
- verificação de sintaxe;
- execução completa de todos os testes em um único comando.

## Premissas

- Não haverá alteração no schema Prisma, migrations ou estrutura do MySQL.
- Os perfis continuarão armazenados como strings, sendo restringidos pela validação da aplicação.
- `admin` administra usuários; `admin`, `advogado` e `usuario` ativos operam somente seus próprios clientes, processos e dashboard.
- As alterações de paginação exigirão adaptação posterior do frontend.
- Os endpoints `PUT` permanecerão apenas para compatibilidade temporária; novos consumidores devem utilizar `PATCH`.
