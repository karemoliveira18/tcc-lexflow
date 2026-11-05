# Carga inicial de produção

O comando `npm run seed:production` importa somente dados reais informados pelo responsável. Suporta todos os modelos: User, Cliente e Processo. O modelo JSON começa apenas com um administrador; listas de clientes/processos podem ficar vazias. Não inventa nomes, e-mails, documentos, processos nem senhas.

## 1. Preparar arquivo e segredos

No diretório `backend`, use Node 24.11.1 e execute:

```powershell
npm ci
npx prisma generate
Copy-Item prisma/seed.production.example.json prisma/seed.production.json
```

Não recopie o exemplo sobre um arquivo já preenchido. Edite o JSON com nome e e-mail reais do administrador. `prisma/seed.production.json` está no .gitignore porque pode conter dados pessoais. O exemplo versionado tem campos vazios de propósito e não pode ser aplicado sem preenchimento.

No ambiente administrativo que executará a carga (ou em `backend/.env`, nunca versionado), configure:

```dotenv
DATABASE_URL="mysql://USUARIO:SENHA_CODIFICADA@HOST:PORTA/BANCO"
LEXFLOW_PROD_ADMIN_PASSWORD=
```

Substitua os marcadores. A senha do administrador deve conter no mínimo 8 caracteres, maiúscula, minúscula, número e símbolo, com no máximo 72 bytes UTF-8 (limite do bcrypt) e sem espaços nas extremidades. Não coloque senha no JSON. Para vários usuários, use variáveis diferentes e senhas diferentes. Esses segredos são necessários apenas para a carga, não para o servidor em execução. Não use o segredo JWT como senha.

## 2. Preencher dados adicionais, se houver

Cada registro recebe uma `key` estável, escolhida por você, com até 64 caracteres: letras minúsculas, números, `_` e `-`. Não altere essa chave depois de importar. Use identificadores internos, sem documentos ou outros dados pessoais nas chaves.

### users

Campos: `key`, `nome`, `email`, `perfil`, `passwordEnv` e opcionalmente `ativo` (padrão true). Perfil: `admin`, `advogado` ou `usuario`. Deve haver pelo menos um administrador ativo. Exemplo estrutural para um usuário adicional (preencha os campos vazios):

```json
{
  "key": "responsavel-01",
  "nome": "",
  "email": "",
  "perfil": "advogado",
  "ativo": true,
  "passwordEnv": "LEXFLOW_PROD_RESPONSAVEL_01_PASSWORD"
}
```

Declare também essa variável de senha no ambiente. E-mails são normalizados para minúsculas. Todas as senhas são verificadas inclusive nas reexecuções, mas contas existentes não têm sua senha modificada.

### clientes

Campos obrigatórios: `key`, `userKey`, `nome`, `cpfCnpj`. `userKey` deve ser a chave de um usuário ativo presente em `users`. O CPF/CNPJ deve ser real, válido e autorizado para importação; a validação usa as mesmas regras da API.

Campos opcionais: `email`, `telefone`, `endereco`, `cidade`, `estado`, `cep`, `observacoes`, `ativo`. As validações e limites são os mesmos da API.

```json
{
  "key": "cliente-01",
  "userKey": "responsavel-01",
  "nome": "",
  "cpfCnpj": "",
  "email": "",
  "telefone": "",
  "endereco": "",
  "cidade": "",
  "estado": "",
  "cep": "",
  "observacoes": "",
  "ativo": true
}
```

### processos

Campos obrigatórios: `key`, `userKey`, `clienteKey`, `titulo`, `area`, `prazo`. O cliente deve pertencer ao mesmo usuário do processo. Informe prazo como `YYYY-MM-DD`, com data existente. A conversão usa a rotina de datas da aplicação.

Campos opcionais: `descricao`, `status` (`ativo`, `aguardando`, `concluído`, `suspenso`) e `prioridade` (`baixa`, `normal`, `alta`).

```json
{
  "key": "processo-01",
  "userKey": "responsavel-01",
  "clienteKey": "cliente-01",
  "titulo": "",
  "area": "",
  "prazo": "",
  "descricao": "",
  "status": "ativo",
  "prioridade": "normal"
}
```

Adicione esses objetos nas respectivas listas do JSON somente depois de preencher os dados reais. O arquivo aceita até 500 registros por lista. Para volumes maiores, planeje uma importação específica.

## 3. Validar sem gravar

```powershell
npm run seed:production -- --check
```

Valida formato, senhas, CPF/CNPJ, datas, duplicidades e vínculos locais, mostrando apenas contagens. Não conecta ao banco; portanto não verifica conflitos com registros já existentes nem conexão/migrations.

## 4. Conferir banco e aplicar manualmente

Confira o destino em DATABASE_URL e faça backup se houver dados. Verifique migrations:

```powershell
npx prisma validate
npx prisma migrate status
```

Se houver migrations pendentes, revise-as e use `npx prisma migrate deploy` somente no fluxo autorizado. Banco com tabelas preexistentes e sem histórico exige análise de baseline. Não use reset ou db push para preparar esta carga.

Depois de validar os dados e conferir o destino:

```powershell
npm run seed:production
```

O comando sem parâmetros grava diretamente no banco de DATABASE_URL. Não exige NODE_ENV nem repetição do nome do banco. O arquivo `backend/.env` é carregado automaticamente, independentemente da pasta de execução, e seus valores têm prioridade sobre variáveis do terminal. Se não houver .env, usa as variáveis do ambiente. `--check` apenas valida; `--apply` continua aceito por compatibilidade. Não execute cargas concorrentes.

No Render, o arquivo privado não virá do GitHub. Prefira executar em um terminal administrativo local confiável com acesso ao MySQL externo. Não versione o JSON para disponibilizá-lo no Render. A carga não faz parte do build/start e não depende do frontend.

## Comportamento e reexecução

- Usuários: procura por e-mail, cria os ausentes e preserva os existentes. Perfil/status divergentes abortam a operação, sem promover ou reativar uma conta existente.
- Clientes: procura pelo par usuário + CPF/CNPJ normalizado. Preserva registros existentes, inclusive dados editados posteriormente. Dados legados com documentos não normalizados devem ser revisados antes da importação.
- Processos: usa ID determinístico derivado da key. Preserva processos já importados; vínculos divergentes abortam. Não identifica duplicatas por título. Processos que já existiam fora desse seed devem ser excluídos do arquivo ou conciliados manualmente antes de importar.
- Todos os inserts ficam na mesma transação: falha desfaz somente as gravações dessa execução. Nenhum update/delete é realizado. IDs de usuários/clientes criados também são estáveis por key; conflitos de chave abortam a transação.
- Senhas são armazenadas com bcrypt. Senhas, documentos e dados pessoais não são impressos pelo script.
- Ao final, aparecem contagens de criados/preservados. Faça login com o administrador, confira permissões e consulte os registros importados. Reexecute o mesmo arquivo para confirmar contagens de preservados, se necessário.
- Este comando é separado do seed de teste. `npm run seed:test` e `npx prisma db seed` continuam apontando para contas fictícias de desenvolvimento e não devem ser usados em produção.

Os testes automatizados cobrem validação e comportamento com banco simulado. A carga real e o rollback MySQL devem ser validados em homologação antes da aplicação em produção. Nenhuma carga real foi executada ao preparar estes arquivos.
