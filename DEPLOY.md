# Auditoria de produção — LexFlow

## A. Situação do projeto

**PRONTO COM PENDÊNCIAS.** Preparação técnica concluída, mas publicação depende de rotacionar credenciais históricas, informar domínio Hostinger e URL Render, preparar MySQL e validar integração. Nenhum deploy, commit, push, seed ou migration em banco foi executado.

## B. Problemas encontrados

### CRÍTICO

- `backend/.env` esteve no histórico Git (por exemplo, commit `42216782`), com conexão MySQL remota contendo senha e JWT secret. Revogue/rotacione a senha, substitua JWT secret (invalidando tokens antigos) e investigue reutilização. Remover o arquivo não resolve a exposição. A limpeza do histórico exige coordenação e não foi feita.
- Schema SQLite incompatível com destino MySQL, sem migrations. Corrigido para MySQL; migration inicial gerada, não aplicada. Dados SQLite existentes não são migrados automaticamente.
- Prisma Client estava em devDependencies, podendo faltar em instalação de produção. Movido para dependencies, alinhado ao CLI 6.19.3.
- Auditoria inicial apontou vulnerabilidade crítica em proxy-addr. Lockfile atualizado com correção compatível. Restam alertas descritos abaixo.

### IMPORTANTE

- Base Vite e BrowserRouter ausentes para subpasta, redirecionamento 401 para `/login`, link absoluto de acesso negado: corrigidos.
- Fallback fixo para localhost e variável antiga VITE_API_BASE_URL: substituídos por VITE_API_URL; build exige URL HTTPS com `/api`.
- Ícone/manifesto fora de public e URLs absolutas: corrigidos; adicionado fallback Apache.
- Babel 8 conflitava com ferramentas Babel 7/Jest: versões compatíveis restauradas e 27 testes passaram.
- Node antigo no README e versão não fixada: Node 24.11.1 documentado e faixa >=24.11.0 <25 nos pacotes.
- CORS agora aceita FRONTEND_URL, normaliza a origem sem caminho e valida HTTPS em produção. Variável legada continua disponível.
- Suite de integração dependia de SQLite. Agora exige TEST_DATABASE_URL de MySQL exclusivo `lexflow_test_*`; não foi executada por falta desse banco.
- Alertas restantes após correções compatíveis: frontend 29 (1 baixo, 22 moderados, 6 altos), principalmente ferramentas de build/teste; backend completo 6 altos (nodemon/chokidar/braces e prisma/@prisma/config/deepmerge-ts). Instalação backend sem dev: 3 altos da cadeia CLI Prisma. Não se aplicou `audit fix --force`: implica mudanças maiores ou regressões de versão. Revisar antes de liberar conforme política de segurança; não é uma auditoria zerada. O CLI usa configuração local, não dados das requisições HTTP.

### MELHORIA

- Bundle JS aproximadamente 650 kB; aviso de chunk grande. Otimização de carregamento fica fora desta preparação.
- Aviso `use client` do React Router no Vite 4 não impediu build/testes.

## C. Arquivos modificados

| Arquivo | Motivo |
| --- | --- |
| `.gitignore` | Ignora ambientes privados, builds, dependências, caches e bancos locais; mantém exemplos. |
| `.node-version` | Fixa Node 24.11.1 para desenvolvimento. |
| `README.md` | Atualiza Node, fluxo MySQL e seção Deploy com três destinos. |
| `DEPLOY.md` | Relatório de auditoria e instruções operacionais completas. |
| `backend/.node-version` | Fixa Node do serviço Render. |
| `backend/.env.example` | Documenta variáveis MySQL, JWT e FRONTEND_URL sem credenciais. |
| `backend/config/env.js` | Valida banco/porta/segredo e normaliza origem CORS. |
| `backend/package.json` | Move Prisma Client para runtime, alinha Prisma, remove adapters não usados, scripts e override qs. |
| `backend/package-lock.json` | Reproduz instalação e correções compatíveis de segurança. |
| `backend/prisma/schema.prisma` | Usa MySQL, preserva modelos/relações e campos longos como TEXT. |
| `backend/prisma/migrations/migration_lock.toml` | Registra o provider MySQL. |
| `backend/prisma/migrations/20261021000000_init_mysql/migration.sql` | Migration inicial gerada offline, sem execução no banco. |
| `backend/server.js` | Adiciona /health e bind 0.0.0.0, preservando /api/health. |
| `backend/tests/integration/api.integration.test.mjs` | Exige MySQL exclusivo de testes em vez de SQLite. |
| `backend/tests/unit/deploy.test.mjs` | Testa health sem banco, CORS/preflight e configurações inválidas. |
| `frontend/.env.example` | Padroniza VITE_API_URL. |
| `frontend/.env.development` | URL de API apenas para desenvolvimento local. |
| `frontend/.env.production.example` | Modelo vazio para URL real de produção. |
| `frontend/.env.local` | Remove arquivo local anteriormente versionado, sem segredos. |
| `frontend/README.md` | Aponta para a documentação de deploy atual. |
| `frontend/package.json` | Node compatível e Babel 7 compatível com Jest. |
| `frontend/package-lock.json` | Lockfile atualizado e correções de segurança compatíveis. |
| `frontend/vite.config.js` | Base explícita e validação de URL na build. |
| `frontend/index.html` | Assets via BASE_URL e remoção de metadata localhost. |
| `frontend/favicon.svg` | Movido para public para cópia estática na build. |
| `frontend/manifest.webmanifest` | Movido para public e corrigido para escopo relativo. |
| `frontend/public/favicon.svg` | Ícone estático incluído na dist. |
| `frontend/public/manifest.webmanifest` | Manifesto com start_url, scope e ícones relativos. |
| `frontend/public/.htaccess` | Fallback Apache para rotas SPA na subpasta. |
| `frontend/src/api.js` | VITE_API_URL sem fallback local; redirecionamento 401 respeita base. |
| `frontend/src/main.jsx` | BrowserRouter usa basename do Vite. |
| `frontend/src/components/ProtectedRoute.jsx` | Link do Router respeita subpasta. |
| `frontend/src/test/navigation.test.jsx` | Regressões para links em subpasta. |

## D. Frontend

```text
Frontend directory: frontend
Build command: npm run build
Build output: frontend/dist
Public path: /tecti/2026/gpec02/
Vite base: /tecti/2026/gpec02/
React Router basename: import.meta.env.BASE_URL = /tecti/2026/gpec02/
.htaccess necessário: SIM
```

## E. Backend

```text
Backend directory: backend
Node version: 24.11.1 (>=24.11.0 <25)
Root Directory: backend
Build Command: npm ci --omit=dev && npx prisma generate
Start Command: npm start
Health Check: /health (alias /api/health)
Port configuration: process.env.PORT || 5000; bind 0.0.0.0
CORS configuration: FRONTEND_URL, origem exata, sem wildcard
Database library: Prisma Client 6.19.3 / MySQL
Prisma migrations: SIM, uma inicial gerada e não aplicada
```

## F. Variáveis de ambiente

### Frontend local

`frontend/.env.development` já contém `VITE_API_URL=http://localhost:5000/api`. Não precisa criar `.env.local`; a versão antiga foi removida do projeto.

### Frontend produção

Crie `frontend/.env.production` a partir de `.env.production.example`:

```dotenv
VITE_API_URL=URL_HTTPS_REAL_DO_RENDER_SEGUIDA_DE_/api
```

Este marcador deve ser substituído, não é uma URL. Nenhum segredo deve usar prefixo VITE_.

### Backend local

Crie/revise `backend/.env` sem sobrescrever credenciais inadvertidamente:

```dotenv
NODE_ENV=development
PORT=5000
DATABASE_URL=mysql://USUARIO:SENHA_URL_ENCODED@HOST_LOCAL:3306/BANCO_LOCAL
JWT_SECRET=SEGREDO_ALEATORIO_LOCAL
FRONTEND_URL=http://localhost:5173
```

### Backend Render

```dotenv
NODE_ENV=production
DATABASE_URL=mysql://USUARIO:SENHA_URL_ENCODED@HOST_MYSQL:PORTA/BANCO
JWT_SECRET=SEGREDO_NOVO_ALEATORIO_COM_PELO_MENOS_32_CARACTERES
FRONTEND_URL=ORIGEM_HTTPS_REAL_DA_HOSTINGER
```

Não definir PORT manualmente. FRONTEND_URL pode aceitar lista separada por vírgulas se precisar de mais de uma origem real. Não use localhost em produção. Senhas com caracteres especiais precisam ser codificadas no componente da URL. TEST_DATABASE_URL é opcional e exclusivo da suite de integração; não configure no Render.

## G. Configuração do Render

```text
Service Type: Web Service
Repository: https://github.com/karemoliveira18/tcc-lexflow
Branch: main (branch atual; selecione outra se for sua branch de produção)
Root Directory: backend
Runtime: Node
Build Command: npm ci --omit=dev && npx prisma generate
Start Command: npm start
Health Check Path: /health
Auto Deploy: desabilitado no primeiro deploy
Environment Variables:
NODE_ENV=production
DATABASE_URL=conexão MySQL externa real
JWT_SECRET=novo segredo aleatório forte
FRONTEND_URL=origem HTTPS real da Hostinger, sem subpasta
```

O servidor conecta ao banco antes de escutar: banco inacessível faz o start falhar, como validado. A rota health não consulta o banco; depois de iniciado, health não comprova disponibilidade contínua do MySQL. Teste também rota autenticada.

## H. Configuração Hostinger / Apache

- Public path e Vite base: `/tecti/2026/gpec02/`.
- Router basename: mesmo caminho via BASE_URL.
- SPA fallback: `index.html` para caminhos sem arquivo/diretório existente.
- Fonte: `frontend/public/.htaccess`; copiado para `frontend/dist/.htaccess`.
- Destino: `.htaccess` ao lado de `index.html` na pasta pública correspondente a `/tecti/2026/gpec02/`.
- Diretório local: `frontend/dist/`. FileZilla envia seu conteúdo completo, não a pasta dist.

## I. Banco

Prisma/MySQL usa somente DATABASE_URL para conexão. Há uma migration inicial que cria User, Cliente e Processo, índices e relações. Leia o SQL antes de aplicar. Para banco vazio: `npx prisma migrate deploy`. Para banco com tabelas: backup, comparação e baseline orientado pelo schema real antes de aplicar; não marque migration como aplicada sem provar equivalência. Nenhum reset faz parte do deploy.

Existe seed restrito a desenvolvimento/homologação. Nunca habilite LEXFLOW_ALLOW_TEST_USERS na produção. O primeiro admin real requer provisionamento manual autorizado; `/api/auth/register` cria usuário comum. Não há tela de cadastro no frontend atual.

## J. Checklist final e evidências

- [x] npm install funcionou nos dois projetos.
- [x] npm run build compilou com URL reservada de validação, não uma URL real do Render.
- [x] dist foi criada e inspecionada; removida depois para impedir upload da build de teste.
- [x] Assets, base, BrowserRouter e .htaccess preparados para a subpasta.
- [x] Frontend não tem fallback de API localhost em produção; VITE_API_URL configurável.
- [x] Backend usa PORT e bind externo; imports relativos conferidos quanto a caixa.
- [ ] Execução Linux real não disponível nesta sessão Windows.
- [ ] npm start com MySQL real: pendente. Testado encerramento por P1001 com banco inacessível.
- [x] CORS, health e preflight verificados em testes sem banco.
- [x] Root Directory, Build Command e Start Command identificados.
- [x] npm ci --omit=dev e prisma generate passaram.
- [x] prisma validate e geração offline do SQL passaram.
- [ ] Migration aplicada e conexão MySQL real: pendentes.
- [ ] Segredos históricos rotacionados: depende do responsável.
- [x] .env.example em ambos os projetos e README com Deploy.
- [x] 27 testes frontend e 8 testes unitários backend passaram; checagem de sintaxe passou.
- [x] Preview HTTP: home, login, dashboard, clientes, JS, CSS, ícone e manifesto retornaram 200.
- [ ] Apache real, Console visual, login e CRUD integrado pendentes. Não havia navegador conectado nem servidor Apache nesta sessão.
- [x] Build sem VITE_API_URL recusada com mensagem explícita.

# INSTRUÇÕES PARA FAZER O DEPLOY

A sequência entre ambientes é: **local → preparar banco (ambiente 4) → Render (ambiente 3) → build/upload Hostinger (ambiente 2) → teste integrado**. O frontend precisa da URL criada no Render; numeração abaixo identifica os ambientes solicitados, não elimina essa dependência.

## AMBIENTE 1 — DESENVOLVIMENTO LOCAL

1. Use Node 24.11.1. Revise as alterações e publique manualmente no GitHub quando aprovadas; nenhum commit/push foi feito por esta auditoria.
2. `frontend/.env.development` já existe. Crie `backend/.env` a partir do exemplo somente se não existir; preencha as cinco variáveis locais acima. O `.env` local preexistente não foi alterado: se apontar para SQLite, atualize para um MySQL local.
3. No PowerShell, a partir da raiz:

```powershell
cd backend
npm install
# Somente se ainda não existir:
if (!(Test-Path .env)) { Copy-Item .env.example .env }
# Edite .env antes dos comandos seguintes.
npx prisma validate
npx prisma generate
# Somente contra o MySQL local vazio/autorizado:
npx prisma migrate deploy
npx prisma migrate status
npm run test:unit
npm run test:syntax
npm start
```

4. Em outro terminal, na raiz:

```powershell
cd frontend
npm install
npm test
npm run dev
```

5. Abra `http://localhost:5173/tecti/2026/gpec02/` e `http://localhost:5000/health`. Teste login com conta local válida e clientes/processos. O health retorna status OK, mas a confirmação do banco exige consulta autenticada.
6. Se desejar a suite de integração, configure TEST_DATABASE_URL somente para um MySQL de testes exclusivo cujo nome comece com `lexflow_test_`, então execute `npm run test:integration` em backend. Ela aplica migrations e cria registros de teste, mantendo-os para inspeção; não use banco de produção.
7. Antes de prosseguir, instalação, validação Prisma, migrations locais, login e CRUD local devem funcionar. Rotacione credenciais históricas antes de configurar produção.

## AMBIENTE 2 — HOSTINGER / APACHE

Execute depois que Render/API e MySQL estiverem operacionais.

1. Em `frontend/.env.production`, coloque VITE_API_URL igual à URL HTTPS real mostrada pelo Render, acrescida de `/api`, sem duplicar esse prefixo. Crie o arquivo copiando `.env.production.example`.
2. Vite base: `/tecti/2026/gpec02/`. Router basename: `import.meta.env.BASE_URL`, resolvido para o mesmo caminho.
3. `.htaccess` já está em public e contém:

```apache
Options -MultiViews
DirectoryIndex index.html
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /tecti/2026/gpec02/
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^ index.html [L]
</IfModule>
```

4. No PowerShell, a partir da raiz:

```powershell
cd frontend
Copy-Item .env.production.example .env.production
# Edite .env.production com a URL real antes de continuar.
npm ci
npm run build
npm run preview
```

Não recopie o exemplo se já tiver configurado o arquivo. Abra o preview informado no terminal, incluindo `/tecti/2026/gpec02/`. Para testar chamadas reais pelo preview, use uma API de homologação cujo CORS permita a origem local; não adicione localhost ao CORS de produção.

5. Abra `frontend/dist` no painel local do FileZilla. Envie index.html, assets/, favicon.svg, manifest.webmanifest e .htaccess para a pasta que corresponde a `/tecti/2026/gpec02/` sob a raiz pública do seu domínio. Confirme a raiz pública no painel Hostinger; não foi informada a localização física dela.
6. Não envie .env, src, node_modules, backend, package.json, banco, .git ou arquivos de teste. Ative exibição de arquivos ocultos para incluir .htaccess.
7. Teste, no domínio real: `/tecti/2026/gpec02/`, `/tecti/2026/gpec02/login` e `/tecti/2026/gpec02/clientes`. Faça F5 na rota interna; sem login deve redirecionar para login dentro da subpasta, sem 404 Apache.
8. Verifique que JS/CSS/imagens retornam seus tipos corretos, não HTML; se ocorrer 500 ao ler .htaccess, confira AllowOverride/diretivas permitidas com a hospedagem.

## AMBIENTE 3 — RENDER

1. Com banco preparado e mudanças já enviadas manualmente ao GitHub, crie Web Service e preencha exatamente os campos da seção G. Configure as variáveis antes de iniciar o build.
2. FRONTEND_URL aponta para a origem real Hostinger (HTTPS, domínio e eventual porta), não para `/tecti/2026/gpec02/`. CORS opera por origem, não por pasta.
3. Não crie PORT. Prisma Client é gerado no build; migrations não estão acopladas a build/start.
4. Auto Deploy inicialmente desabilitado. Depois de validar, pode habilitar para main se houver revisão e execução controlada das migrations antes das versões dependentes delas.
5. Teste a URL pública exibida no Render acrescida de `/health`, depois `/api/health`. `/api/clientes` sem token deve retornar 401, não 500. Faça login e GET autenticado de clientes para validar banco. Confira logs, evitando copiar segredos.

## AMBIENTE 4 — BANCO DE DADOS DE PRODUÇÃO

Execute antes de iniciar o backend de produção.

1. Obtenha host, porta, nome do banco, usuário, senha nova e requisitos TLS/CA. Verifique suporte a conexões externas provenientes do Render. Se a hospedagem não permitir MySQL remoto, será necessário um provedor que permita.
2. Configure DATABASE_URL no Render e em um terminal administrativo confiável para aplicar migrations. Não coloque credenciais em comandos versionados, prints ou README.
3. Faça backup se houver dados. Se banco vazio e criação autorizada, no diretório backend e com DATABASE_URL de produção configurada apenas naquele ambiente administrativo:

```powershell
npx prisma validate
npx prisma migrate deploy
npx prisma migrate status
```

4. Em banco existente, interrompa esse fluxo até comparar schema e preparar baseline revisado. Nunca use reset ou db push como fluxo de produção. Dados SQLite antigos exigem transferência separada e conferida.
5. Não rode seed de teste. Crie/provisione o administrador real por procedimento autorizado; contas cadastradas na API começam com perfil usuario.
6. Verifique logs de conexão do Render, autentique uma conta real autorizada e consulte `/api/clientes` e `/api/processos`. Health sozinho não consulta o banco.

## AMBIENTE 5 — TESTE INTEGRADO FINAL

1. Abra a home Hostinger; confira CSS, logo e manifesto.
2. Abra /login diretamente e atualize. Depois de autenticar, abra /clientes e atualize.
3. Em Network, confirme que chamadas vão para a URL Render com `/api`, sem localhost, mixed content ou prefixo duplicado.
4. Teste login válido, inválido e logout; sessão inválida deve retornar ao login na subpasta.
5. Crie cliente de teste autorizado; leia e edite seus dados.
6. Crie processo ligado a esse cliente; leia e atualize. Confira métricas no dashboard.
7. Exclua somente o processo de teste e depois o cliente de teste, conforme as regras existentes; não apague dados reais para validar deploy.
8. Com admin autorizado, teste gestão de usuários e alteração de status. A aplicação não possui exclusão permanente de usuários.
9. Com usuário comum, confirme restrição da tela /usuarios e isolamento dos dados de outros usuários.
10. Confira Console, Network, respostas de erro, CORS/preflight e logs Render. Revalide health e uma consulta autenticada.

Referências: [Render Web Services](https://render.com/docs/web-services), [Render monorepos](https://render.com/docs/monorepo-support), [Prisma Migrate v6](https://www.prisma.io/docs/orm/v6/prisma-migrate/getting-started).
