Collecting workspace informationVou analisar o sistema de usuários e criar um manual completo baseado nos arquivos do projeto.

# 📚 Manual do Sistema de Usuários - CRM Travel SaaS

## 📖 Índice

1. Visão Geral
2. Perfis e Permissões
3. Funcionalidades do Módulo
4. Guia do Usuário
5. Guia do Desenvolvedor
6. Regras de Negócio
7. Segurança
8. Logs e Auditoria

---

## 🎯 Visão Geral

O Sistema de Usuários é um módulo fundamental do CRM Travel SaaS que gerencia todos os acessos e permissões dentro de cada agência (tenant). Ele implementa um sistema robusto de multi-tenancy onde cada agência opera de forma completamente isolada.

### Características Principais:
- **Multi-tenancy completo**: Isolamento total entre agências
- **Hierarquia de permissões**: Sistema de roles com 4 níveis
- **Autenticação segura**: JWT com refresh tokens
- **Logs de auditoria**: Rastreamento completo de ações
- **Gestão simplificada**: Interface intuitiva para gerenciar usuários

---

## 👥 Perfis e Permissões

### Hierarquia de Roles

```
DEVELOPER (Super Admin)
    ↓
  MASTER (Dono da Agência)
    ↓
  ADMIN (Gerente)
    ↓
  AGENT (Vendedor)
```

### Detalhamento dos Perfis

#### 🛠️ **DEVELOPER** (Desenvolvedor)
- **Acesso**: Global à plataforma
- **Permissões**:
  - Gerenciar todas as agências (tenants)
  - Acessar logs globais do sistema
  - Configurar parâmetros da plataforma
  - Suporte técnico avançado
- **Restrições**: Não pode interferir em dados de negócio das agências

#### 👑 **MASTER** (Proprietário)
- **Acesso**: Total dentro da sua agência
- **Permissões**:
  - Criar/editar/excluir usuários de qualquer tipo
  - Acessar todos os módulos administrativos
  - Visualizar relatórios financeiros completos
  - Configurar integrações e parâmetros da agência
  - Transferir clientes entre agentes
  - Visualizar logs de todos os usuários
- **Restrições**: Limitado à sua própria agência

#### 👔 **ADMIN** (Administrador)
- **Acesso**: Administrativo na agência
- **Permissões**:
  - Criar/editar usuários AGENT
  - Acessar módulos administrativos (exceto financeiro sensível)
  - Gerenciar catálogo, operadoras e funis
  - Visualizar relatórios operacionais
  - Transferir clientes entre agentes
- **Restrições**: 
  - Não pode criar/editar usuários MASTER ou ADMIN
  - Acesso limitado a dados financeiros

#### 👤 **AGENT** (Agente/Vendedor)
- **Acesso**: Operacional básico
- **Permissões**:
  - Gerenciar seus próprios clientes
  - Criar e editar propostas
  - Registrar interações e tarefas
  - Visualizar seus próprios logs
  - Editar seu próprio perfil
- **Restrições**:
  - Sem acesso a funções administrativas
  - Visualiza apenas seus próprios dados

---

## 🔧 Funcionalidades do Módulo

### 1. **Listagem de Usuários** (users)
- Tabela completa com todos os usuários da agência
- Filtros por: role, status (ativo/inativo), data de criação
- Busca por: nome, email, telefone
- Indicadores visuais: status online/offline, último acesso
- Ações rápidas: editar, ativar/desativar, resetar senha

### 2. **Criação de Usuário**
- Formulário com validações em tempo real
- Campos obrigatórios: nome, email, role, senha
- Campos opcionais: telefone, avatar
- Validação de senha forte (8+ caracteres, maiúscula, número, especial)
- Email único por agência

### 3. **Perfil do Usuário** (`/users/[userId]`)
- **Aba Informações Gerais**: dados pessoais, avatar, contatos
- **Aba Segurança**: alterar senha, autenticação 2FA, sessões ativas
- **Aba Atividades**: histórico de ações do usuário
- **Aba Permissões**: detalhamento de acessos por módulo

### 4. **Gestão de Sessões**
- Visualização de dispositivos conectados
- Encerrar sessões remotamente
- Histórico de IPs e localizações
- Alertas de acessos suspeitos

---

## 📱 Guia do Usuário

### Para MASTER/ADMIN

#### Como criar um novo usuário:
1. Acesse **Funções Administrativas** > **Usuários**
2. Clique em **"Novo Usuário"**
3. Preencha os dados:
   - Nome completo
   - Email (será o login)
   - Telefone (opcional)
   - Selecione o tipo de perfil
   - Defina uma senha temporária
4. Clique em **"Salvar"**
5. O sistema enviará um email de boas-vindas

#### Como desativar um usuário:
1. Na listagem, encontre o usuário
2. Clique nos três pontos (...) > **"Desativar"**
3. Confirme a ação
4. O usuário não conseguirá mais fazer login

#### Como resetar senha:
1. Na listagem ou perfil do usuário
2. Clique em **"Resetar Senha"**
3. Uma senha temporária será gerada
4. O usuário receberá email com instruções

### Para todos os usuários

#### Como alterar sua senha:
1. Clique no seu avatar > **"Meu Perfil"**
2. Acesse a aba **"Segurança"**
3. Digite a senha atual
4. Digite a nova senha (2x)
5. Clique em **"Alterar Senha"**

#### Como ativar 2FA:
1. Em **"Meu Perfil"** > **"Segurança"**
2. Clique em **"Ativar Autenticação em 2 Fatores"**
3. Escaneie o QR Code com seu app autenticador
4. Digite o código de 6 dígitos
5. Guarde os códigos de backup

---

## 💻 Guia do Desenvolvedor

### Estrutura de Arquivos

```
app/(dashboard)/users/
├── page.tsx                    # Listagem de usuários
├── [userId]/
│   └── page.tsx               # Perfil detalhado
│
lib/
├── actions/users/
│   ├── create-user.ts         # Criar usuário
│   ├── update-user.ts         # Atualizar dados
│   ├── change-password.ts     # Alterar senha
│   ├── toggle-status.ts       # Ativar/desativar
│   └── get-users.ts           # Buscar usuários
│
├── validations/users/
│   └── user.schema.ts         # Schemas Zod
│
└── db/schema/
    └── users.ts               # Schema do banco
```

### Schema do Banco de Dados

```typescript
// Tabela users
{
  id: string (UUID),
  agencyId: string,
  email: string (unique per agency),
  name: string,
  phone?: string,
  avatar?: string,
  role: 'master' | 'admin' | 'agent',
  isActive: boolean,
  lastLogin?: timestamp,
  password: string (hashed),
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Exemplo de Action

```typescript
// lib/actions/users/create-user.ts
export async function createUserAction(data: CreateUserInput) {
  // 1. Verificar autenticação
  const session = await getSession();
  if (!session) throw new AuthenticationError();
  
  // 2. Verificar permissões
  if (!canCreateUser(session.role, data.role)) {
    throw new AuthorizationError();
  }
  
  // 3. Validar dados
  const validated = createUserSchema.parse(data);
  
  // 4. Hash da senha
  const hashedPassword = await hashPassword(validated.password);
  
  // 5. Criar usuário
  const user = await db.insert(users).values({
    ...validated,
    password: hashedPassword,
    agencyId: session.agencyId,
  });
  
  // 6. Log de auditoria
  await ActivityLogger.log({
    action: 'user.create',
    entityType: 'user',
    entityId: user.id,
    metadata: { role: validated.role }
  });
  
  return { success: true, user };
}
```

### Hooks Customizados

```typescript
// hooks/use-permissions.ts
export function usePermissions() {
  const { user } = useAuth();
  
  return {
    canCreateUsers: () => ['master', 'admin'].includes(user.role),
    canEditUser: (targetRole: string) => {
      if (user.role === 'master') return true;
      if (user.role === 'admin' && targetRole === 'agent') return true;
      return false;
    },
    canDeleteUsers: () => user.role === 'master',
  };
}
```

---

## 📐 Regras de Negócio

### Hierarquia de Criação
- **MASTER** pode criar: MASTER, ADMIN, AGENT
- **ADMIN** pode criar: apenas AGENT
- **AGENT** não pode criar usuários

### Validações
1. **Email único**: Por agência (multi-tenancy)
2. **CPF/CNPJ**: Opcional mas validado se preenchido
3. **Telefone**: Formato brasileiro com DDD
4. **Senha forte**: 
   - Mínimo 8 caracteres
   - 1 letra maiúscula
   - 1 número
   - 1 caractere especial

### Limites
- Máximo de usuários por agência: definido no plano
- Sessões simultâneas: 5 por usuário
- Tentativas de login: 5 antes de bloquear por 30 minutos

---

## 🔒 Segurança

### Autenticação
- **Método**: JWT com refresh tokens
- **Expiração**: Access token 15min, Refresh token 7 dias
- **Armazenamento**: HttpOnly cookies seguros

### Proteção de Rotas
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get('token');
  
  if (!token && request.nextUrl.pathname.startsWith('/users')) {
    return NextResponse.redirect('/login');
  }
  
  // Verificar role para rotas administrativas
  const user = await verifyToken(token);
  if (!['master', 'admin'].includes(user.role) && 
      request.nextUrl.pathname.startsWith('/users')) {
    return NextResponse.redirect('/');
  }
}
```

### Criptografia
- Senhas: bcrypt com salt rounds 12
- Tokens: RSA 2048 bits
- Dados sensíveis: AES-256-GCM

---

## 📊 Logs e Auditoria

### Eventos Registrados
- **Login/Logout**: IP, dispositivo, localização
- **Criação de usuário**: Quem criou, dados iniciais
- **Alteração de dados**: Campos alterados, valores anteriores
- **Alteração de senha**: Confirmação sem expor senha
- **Ativação/Desativação**: Motivo quando fornecido
- **Tentativas de acesso negado**: Para análise de segurança

### Estrutura do Log
```typescript
{
  id: string,
  agencyId: string,
  userId: string,
  action: 'user.create' | 'user.update' | 'user.delete' | ...,
  entityType: 'user',
  entityId: string,
  metadata: {
    changes?: object,
    ip?: string,
    userAgent?: string,
    reason?: string
  },
  createdAt: timestamp
}
```

### Visualização de Logs
- **MASTER/ADMIN**: Veem todos os logs de usuários
- **AGENT**: Veem apenas seus próprios logs
- **Filtros**: Por usuário, ação, período, módulo
- **Exportação**: CSV, PDF para compliance

---

## 🚨 Troubleshooting

### Problemas Comuns

**Usuário não consegue fazer login:**
1. Verificar se está ativo
2. Conferir tentativas de login (pode estar bloqueado)
3. Resetar senha se necessário

**Email duplicado:**
- Verificar se já existe na agência
- Lembrar que é único por tenant, não global

**Permissões negadas:**
- Conferir role do usuário
- Verificar se a rota está protegida corretamente
- Revisar logs de acesso negado

---

## 📞 Suporte

Para questões técnicas ou bugs, contate o time de desenvolvimento com:
- ID da agência
- ID do usuário afetado
- Descrição detalhada do problema
- Logs relevantes se disponíveis

---

*Última atualização: [Data atual]*