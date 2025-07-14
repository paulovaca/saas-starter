## 🎯 O que vamos fazer nesta fase

Antes de começar a desenvolver os módulos do sistema (Clientes, Propostas, etc.), precisamos preparar uma base sólida. É como construir uma casa: primeiro fazemos a fundação forte, depois levantamos as paredes.

## 📋 Pré-requisitos

### O que você precisa ter instalado no computador:

1. **Visual Studio Code** (editor de código)
   - Baixe em: https://code.visualstudio.com/
   - Instale com as opções padrão

2. **Node.js** (ambiente para executar JavaScript)
   - Baixe em: https://nodejs.org/
   - Escolha a versão LTS
   - Durante a instalação, marque todas as opções

3. **Git** (controle de versão)
   - Baixe em: https://git-scm.com/
   - Instale com as opções padrão

4. **Docker Desktop** (para o banco de dados)
   - Baixe em: https://www.docker.com/products/docker-desktop
   - Será necessário criar uma conta gratuita
   - Após instalar, abra o Docker Desktop

## 🚀 PASSO A PASSO DETALHADO

### 📁 Etapa 1: Preparar o Ambiente

#### Passo 1.1: Abrir o projeto
1. Abra o Visual Studio Code
2. Clique em `File > Open Folder`
3. Navegue até a pasta `saas-starter`
4. Clique em "Selecionar Pasta"

#### Passo 1.2: Abrir o terminal
1. No VS Code, pressione `Ctrl + '` (control + aspas simples)
2. Um terminal aparecerá na parte inferior da tela

#### Passo 1.3: Verificar instalações
No terminal, digite cada comando e pressione Enter:

```bash
node --version
```
Deve aparecer algo como: v20.x.x

```bash
npm --version
```
Deve aparecer algo como: 10.x.x

```bash
git --version
```
Deve aparecer algo como: git version 2.x.x

### 📂 Etapa 2: Reorganizar a Estrutura de Pastas

#### Passo 2.1: Criar a nova estrutura de pastas

No terminal do VS Code, vamos criar as pastas necessárias. Digite cada comando e pressione Enter:

```bash
# Criar estrutura em lib
mkdir -p lib/actions/auth;
mkdir -p lib/actions/agency;
mkdir -p lib/actions/users;
mkdir -p lib/validations;
mkdir -p lib/db/schema;
mkdir -p lib/db/queries;
mkdir -p lib/services/auth;
mkdir -p lib/services/activity-logger;
mkdir -p lib/services/error-handler;
mkdir -p lib/services/cache;
mkdir -p lib/config;

# Criar estrutura em app
mkdir -p app/api/v1/auth;
mkdir -p app/api/v1/agency;
mkdir -p app/api/v1/webhooks
```

**Nota para Windows**: Se o comando `mkdir -p` não funcionar, use:
```powershell
# No PowerShell do Windows
New-Item -ItemType Directory -Force -Path "lib/actions/auth"
New-Item -ItemType Directory -Force -Path "lib/actions/agency"
# ... e assim por diante para cada pasta
```

#### Passo 2.2: Mover arquivos existentes

Agora vamos reorganizar os arquivos que já existem:

1. No VS Code, na barra lateral esquerda (Explorer), você verá a estrutura de arquivos
2. Vamos mover alguns arquivos para os novos locais:

**Movendo arquivos de autenticação:**
- Encontre o arquivo `app/(login)/actions.ts` (se existir)
- Clique com o botão direito > Cut (Recortar)
- Navegue até `lib/actions/auth`
- Clique com o botão direito > Paste (Colar)
- Renomeie para `sign-in.ts`

### 📝 Etapa 3: Criar Arquivos de Configuração

#### Passo 3.1: Criar arquivo de variáveis de ambiente tipadas

1. Na pasta `lib/config`, clique com botão direito
2. Selecione "New File" (Novo Arquivo)
3. Nome o arquivo como `env.ts`
4. **Este arquivo servirá para**: Validar e tipar todas as variáveis de ambiente do sistema, garantindo que não haverá erros por variáveis faltando ou com valores incorretos

#### Passo 3.2: Criar arquivo de exemplo de variáveis

1. Na raiz do projeto, crie um arquivo .env.example
2. **Este arquivo servirá para**: Documentar todas as variáveis de ambiente necessárias para outros desenvolvedores

### 🛡️ Etapa 4: Sistema de Tratamento de Erros

#### Passo 4.1: Criar classes de erro customizadas

1. Na pasta `lib/services/error-handler`, crie o arquivo `index.ts`
2. **Este arquivo servirá para**: Definir tipos específicos de erros (AuthenticationError, ValidationError, etc.) que ajudarão a identificar e tratar problemas de forma consistente

#### Passo 4.2: Criar wrapper para Server Actions

1. Na mesma pasta, crie o arquivo `action-wrapper.ts`
2. **Este arquivo servirá para**: Envolver todas as ações do servidor com tratamento de erro automático, log de atividades e validação

### ✅ Etapa 5: Sistema de Validação

#### Passo 5.1: Criar validações comuns brasileiras

1. Na pasta `lib/validations`, crie o arquivo `common.schema.ts`
2. **Este arquivo servirá para**: Validar CPF, CNPJ, telefone brasileiro, CEP e outros dados específicos do Brasil

#### Passo 5.2: Criar validações de autenticação

1. Na mesma pasta, crie o arquivo `auth.schema.ts`
2. **Este arquivo servirá para**: Validar dados de login, registro e alteração de senha

### 📊 Etapa 6: Sistema de Banco de Dados

#### Passo 6.1: Separar schemas por domínio

1. Na pasta `lib/db/schema`, crie os seguintes arquivos:
   - `auth.ts` - **Servirá para**: Definir tabelas de usuários e roles
   - `agency.ts` - **Servirá para**: Definir tabelas de agências
   - `activity.ts` - **Servirá para**: Definir tabela de logs de atividade
   - `index.ts` - **Servirá para**: Exportar todos os schemas de um único lugar

#### Passo 6.2: Criar queries organizadas

1. Na pasta `lib/db/queries`, crie:
   - `auth.ts` - **Servirá para**: Queries relacionadas a autenticação
   - `agency.ts` - **Servirá para**: Queries relacionadas a agências
   - `activity.ts` - **Servirá para**: Queries para buscar logs

### 📝 Etapa 7: Sistema de Logs de Atividade

#### Passo 7.1: Criar o serviço de logging

1. Na pasta `lib/services/activity-logger`, crie `index.ts`
2. **Este arquivo servirá para**: Registrar automaticamente todas as ações importantes do sistema (login, criação de cliente, etc.)

#### Passo 7.2: Criar migration para tabela de logs

No terminal, execute:
```bash
npm run db:generate
```

Isso criará uma nova migration para a tabela de logs de atividade.

### 🚀 Etapa 8: Refatorar Actions Existentes

#### Passo 8.1: Atualizar action de sign-in

1. Abra o arquivo `lib/actions/auth/sign-in.ts`
2. **O que fazer**: Adicionar o novo sistema de validação, tratamento de erros e logging
3. Salve o arquivo com `Ctrl + S`

#### Passo 8.2: Atualizar action de sign-up

1. Crie o arquivo `lib/actions/auth/sign-up.ts`
2. **O que fazer**: Implementar registro com validação completa e criação de agência

### 💾 Etapa 9: Sistema de Cache

#### Passo 9.1: Criar gerenciador de cache

1. Na pasta `lib/services/cache`, crie `manager.ts`
2. **Este arquivo servirá para**: Armazenar em memória dados que são acessados frequentemente, melhorando a performance

#### Passo 9.2: Criar queries com cache

1. Na pasta db, crie `cached-queries.ts`
2. **Este arquivo servirá para**: Implementar queries que automaticamente usam cache

### 🧪 Etapa 10: Configurar Testes

#### Passo 10.1: Instalar dependências de teste

No terminal, execute:
```bash
npm install --save-dev jest @types/jest ts-jest @testing-library/react @testing-library/jest-dom
```

#### Passo 10.2: Criar configuração do Jest

1. Na raiz do projeto, crie `jest.config.js`
2. **Este arquivo servirá para**: Configurar como os testes serão executados

#### Passo 10.3: Criar primeiro teste

1. Crie a pasta `__tests__/validations`
2. Dentro dela, crie `common.schema.test.ts`
3. **Este arquivo servirá para**: Testar se as validações de CPF, CNPJ, etc. funcionam corretamente

### ✅ Etapa 11: Verificação Final

#### Passo 11.1: Executar o projeto

No terminal:
```bash
npm run dev
```

O projeto deve iniciar sem erros. Acesse http://localhost:3000

#### Passo 11.2: Testar funcionalidades

1. Tente fazer login
2. Tente criar uma nova conta
3. Verifique se os logs estão sendo salvos

#### Passo 11.3: Executar testes

No terminal:
```bash
npm test
```

Todos os testes devem passar.

## 📋 Checklist de Conclusão

Antes de prosseguir para a Fase 2, verifique:

- [ ] Todas as pastas foram criadas conforme o plano
- [ ] Os arquivos de configuração estão no lugar
- [ ] O sistema de erros está funcionando
- [ ] As validações brasileiras estão implementadas
- [ ] Os logs de atividade estão sendo salvos
- [ ] O cache está configurado
- [ ] Os testes estão passando
- [ ] O projeto inicia sem erros

## 🎯 Próximos Passos

Após completar esta fase de melhorias fundamentais, você terá uma base sólida para implementar:
- **Fase 2**: Módulos de Configuração (Usuários, Funis, Catálogo, Operadoras)
- **Fase 3**: Core do CRM (Clientes e Propostas)
- **Fase 4**: Pós-Venda e Financeiro
- **Fase 5**: Módulos de Suporte

## 💡 Dicas Importantes

1. **Sempre salve seus arquivos** com `Ctrl + S` após fazer alterações
2. **Commite suas mudanças** regularmente com:
   ```bash
   git add .
   git commit -m "Descrição do que foi feito"
   ```
3. **Se encontrar erros**, leia a mensagem com calma - geralmente indica exatamente o problema
4. **Mantenha o Docker Desktop aberto** para o banco de dados funcionar
5. **Teste cada etapa** antes de prosseguir para a próxima

---

Este guia foi criado para ser seguido passo a passo. Não pule etapas, pois cada uma depende da anterior. Com paciência e atenção aos detalhes, você conseguirá implementar toda a Fase 1 com sucesso! 🚀