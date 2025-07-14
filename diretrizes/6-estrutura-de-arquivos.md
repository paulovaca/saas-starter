# 📁 ESTRUTURA DE ARQUIVOS DO PROJETO

## 🏗️ Arquitetura Geral

```
saas-starter/
├── app/                          # App Router do Next.js
│   ├── (auth)/                   # Grupo de rotas de autenticação
│   │   ├── login/               
│   │   ├── register/            
│   │   └── forgot-password/     
│   │
│   ├── (dashboard)/              # Grupo de rotas autenticadas
│   │   ├── layout.tsx           # Layout com sidebar e header
│   │   ├── page.tsx             # Dashboard principal
│   │   ├── users/               # Gestão de usuários
│   │   ├── funnels/             # Funis de venda
│   │   ├── catalog/             # Catálogo de itens
│   │   ├── operators/           # Operadoras
│   │   ├── clients/             # Clientes (Fase 3)
│   │   ├── proposals/           # Propostas (Fase 3)
│   │   ├── reservations/        # Reservas (Fase 4)
│   │   ├── financial/           # Financeiro (Fase 4)
│   │   ├── reports/             # Relatórios (Fase 5)
│   │   └── settings/            # Configurações
│   │
│   ├── api/                      # API Routes
│   │   ├── auth/                # Endpoints de autenticação
│   │   ├── webhooks/            # Webhooks externos
│   │   └── cron/                # Jobs agendados
│   │
│   ├── layout.tsx               # Layout raiz
│   └── globals.css              # Estilos globais
│
├── components/                   # Componentes React
│   ├── ui/                      # Componentes base (shadcn/ui)
│   ├── layout/                  # Componentes de layout
│   │   ├── header.tsx          
│   │   ├── sidebar.tsx         
│   │   └── footer.tsx          
│   ├── users/                   # Componentes do módulo de usuários
│   ├── funnels/                 # Componentes do módulo de funis
│   ├── catalog/                 # Componentes do módulo de catálogo
│   ├── operators/               # Componentes do módulo de operadoras
│   └── shared/                  # Componentes compartilhados
│
├── lib/                         # Lógica de negócio e utilitários
│   ├── actions/                 # Server Actions
│   │   ├── auth/               
│   │   ├── users/              
│   │   ├── funnels/            
│   │   ├── catalog/            
│   │   └── operators/          
│   │
│   ├── db/                      # Banco de dados
│   │   ├── schema/             # Schemas do Drizzle
│   │   │   ├── auth.ts         
│   │   │   ├── users.ts        
│   │   │   ├── funnels/        
│   │   │   ├── catalog.ts      
│   │   │   └── operators.ts    
│   │   ├── migrations/          # Arquivos de migração
│   │   └── index.ts            # Cliente do banco
│   │
│   ├── validations/             # Schemas de validação (Zod)
│   │   ├── auth/               
│   │   ├── users/              
│   │   ├── funnels/            
│   │   ├── catalog/            
│   │   └── operators/          
│   │
│   ├── auth/                    # Configuração de autenticação
│   │   ├── config.ts           # Configuração do Lucia
│   │   ├── permissions.ts      # Sistema de permissões
│   │   └── utils.ts           
│   │
│   ├── api/                     # Clientes de API externa
│   ├── utils/                   # Funções utilitárias
│   └── constants/               # Constantes do sistema
│
├── hooks/                       # React Hooks customizados
│   ├── use-auth.ts             # Hook de autenticação
│   ├── use-permissions.ts      # Hook de permissões
│   └── use-agency.ts           # Hook de contexto da agência
│
├── types/                       # TypeScript types
│   ├── auth.ts                 
│   ├── users.ts                
│   ├── database.ts             
│   └── api.ts                  
│
├── public/                      # Arquivos estáticos
│   ├── images/                 
│   └── fonts/                  
│
├── config/                      # Arquivos de configuração
│   ├── site.ts                 # Metadados do site
│   └── navigation.ts           # Configuração de menu
│
└── middleware.ts               # Middleware do Next.js
```

## 📋 Convenções de Nomenclatura

### Arquivos e Pastas
- **Componentes**: PascalCase (`UserFormModal.tsx`)
- **Utilities/Hooks**: camelCase (`useAuth.ts`)
- **Actions/API**: kebab-case (`create-user.ts`)
- **Schemas**: kebab-case com `.schema.ts` (`user.schema.ts`)

### Componentes
- **Pages**: Sempre `page.tsx`
- **Layouts**: Sempre `layout.tsx`
- **Loading**: Sempre `loading.tsx`
- **Error**: Sempre `error.tsx`

### Server Actions
- Prefixo com ação: `create-`, `update-`, `delete-`, `get-`
- Sufixo com entidade: `-user`, `-funnel`, `-operator`

## 🔧 Padrões de Código

### Server Components vs Client Components
- **Server Components** (padrão): Pages, layouts, data fetching
- **Client Components** (`"use client"`): Formulários, modais, interatividade

### Data Fetching
```typescript
// Em Server Components (pages)
const data = await getUsersAction();

// Em Client Components (via Server Actions)
const handleSubmit = async (formData) => {
  const result = await createUserAction(formData);
};
```

### Estrutura de Actions
```typescript
// lib/actions/users/create-user.ts
export async function createUserAction(data: CreateUserInput) {
  // 1. Verificar autenticação
  // 2. Verificar permissões
  // 3. Validar dados
  // 4. Executar operação
  // 5. Log de auditoria
  // 6. Retornar resultado
}
```

### Estrutura de Validações
```typescript
// lib/validations/users/user.schema.ts
export const createUserSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  role: z.enum(['master', 'admin', 'agent']),
  password: z.string().min(8),
});
```

## 🎯 Organização por Funcionalidade

Cada módulo principal segue a mesma estrutura:

```
módulo/
├── app/(dashboard)/[módulo]/     # Páginas
├── components/[módulo]/          # Componentes específicos
├── lib/actions/[módulo]/         # Server Actions
├── lib/validations/[módulo]/     # Schemas de validação
└── lib/db/schema/[módulo]/       # Schemas do banco
```

## 🔒 Segurança e Permissões

### Middleware
- Verifica autenticação em rotas protegidas
- Redireciona não autenticados para login

### Server Actions
- Sempre verificam autenticação
- Sempre verificam permissões baseadas em role
- Sempre validam dados de entrada
- Sempre registram logs de auditoria

### Componentes
- Usam `usePermissions()` para mostrar/ocultar elementos
- Validação client-side como UX, server-side como segurança

## 📝 Logs e Auditoria

Todas as ações críticas são registradas:
- Criação/edição/exclusão de registros
- Login/logout de usuários
- Mudanças de permissão
- Operações financeiras

Estrutura do log:
```typescript
{
  userId: string,
  action: string,
  entity: string,
  entityId: string,
  changes: object,
  ip: string,
  timestamp: Date
}
```