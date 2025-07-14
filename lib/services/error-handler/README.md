# Sistema de Tratamento de Erros de Banco de Dados

Este documento descreve o sistema de tratamento melhorado de erros de banco de dados, que converte códigos de erro PostgreSQL em mensagens amigáveis ao usuário.

## Visão Geral

O sistema é composto por:

1. **Mapeamento de Erros**: Arquivo `database-errors.ts` com mapeamento de códigos PostgreSQL para mensagens em português
2. **Integração com Action Wrapper**: Detecção automática e tratamento de erros de banco
3. **Mensagens Específicas**: Tratamento especial para campos comuns como email, CPF, CNPJ
4. **Logs Detalhados**: Registro de erros originais para debugging

## Funcionalidades

### 1. Mapeamento Abrangente de Códigos PostgreSQL

O sistema mapeia mais de 100 códigos de erro PostgreSQL organizados por categorias:

- **Classe 08**: Erros de Conexão
- **Classe 22**: Erros nos Dados
- **Classe 23**: Violação de Integridade
- **Classe 25**: Estado de Transação Inválido
- **Classe 28**: Autorização Inválida
- **Classe 40**: Transação Cancelada
- **Classe 42**: Erro de Sintaxe ou Acesso
- **Classe 53**: Recursos Insuficientes
- **Classe 54**: Limite Excedido
- **Classe 57**: Intervenção do Operador
- **Classe 58**: Erro do Sistema
- **Classe P0**: Erro de PL/pgSQL
- **Classe XX**: Erro Interno

### 2. Tratamento Especial para Violações de Integridade

#### Chave Única (23505)
```typescript
// Erro original:
// Key (email)=(user@example.com) already exists.

// Resultado:
{
  message: "Este e-mail já está cadastrado.",
  field: "email"
}
```

#### NOT NULL (23502)
```typescript
// Erro original:
// null value in column "name" violates not-null constraint

// Resultado:
{
  message: "O campo \"Nome\" é obrigatório.",
  field: "name"
}
```

#### Chave Estrangeira (23503)
```typescript
// Erro original:
// Key (user_id)=(123) is not present in table "users".

// Resultado:
{
  message: "Não é possível realizar esta operação pois o registro está sendo usado em \"users\".",
  field: "user_id"
}
```

### 3. Mensagens Específicas por Campo

O sistema reconhece campos comuns e retorna mensagens específicas:

| Campo | Mensagem |
|-------|----------|
| `email` | "Este e-mail já está cadastrado." |
| `cpf` | "Este CPF já está cadastrado." |
| `cnpj` | "Este CNPJ já está cadastrado." |
| `phone` | "Este telefone já está cadastrado." |
| `name` | "Este nome já está em uso." |
| `username` | "Este nome de usuário já está em uso." |
| `code` | "Este código já está em uso." |
| `slug` | "Este identificador já está em uso." |
| `tax_id` | "Este documento já está cadastrado." |

## Como Usar

### 1. Tratamento Automático

O sistema é integrado ao `ActionWrapper` e funciona automaticamente:

```typescript
// Em uma action que usa o wrapper
export const createUser = withActionWrapper(
  async (context, userData) => {
    // Se houver erro de duplicação, será automaticamente
    // convertido em mensagem amigável
    return await db.insert(users).values(userData);
  },
  {
    requireAuth: true,
    schema: createUserSchema,
    activityType: 'user.create'
  }
);
```

### 2. Tratamento Manual

Para casos específicos, você pode usar diretamente:

```typescript
import { handleDatabaseError, isPostgresError } from '@/lib/services/error-handler/database-errors';

try {
  await db.insert(users).values(userData);
} catch (error) {
  if (isPostgresError(error)) {
    const friendlyError = handleDatabaseError(error);
    return { success: false, error: friendlyError.message };
  }
  // Handle other errors...
}
```

### 3. Verificação de Tipo de Erro

```typescript
import { isPostgresError, getPostgresErrorCategory } from '@/lib/services/error-handler/database-errors';

if (isPostgresError(error)) {
  const category = getPostgresErrorCategory(error.code);
  console.log(`Erro da categoria: ${category}`);
}
```

## Estrutura do Código

### handleDatabaseError(error: any): AppError

Função principal que converte erros PostgreSQL em erros amigáveis.

**Parâmetros:**
- `error`: Erro original do PostgreSQL ou qualquer outro erro

**Retorna:**
- `AppError`: Erro formatado com mensagem amigável
- `ValidationError`: Para erros de validação (duplicação, campos obrigatórios)
- `DatabaseError`: Para erros gerais de banco

### isPostgresError(error: any): boolean

Verifica se um erro é específico do PostgreSQL.

**Parâmetros:**
- `error`: Qualquer tipo de erro

**Retorna:**
- `boolean`: true se for erro PostgreSQL válido

### getPostgresErrorCategory(code: string): string

Obtém a categoria de um código de erro PostgreSQL.

**Parâmetros:**
- `code`: Código de erro PostgreSQL (5 caracteres)

**Retorna:**
- `string`: Nome da categoria do erro

## Exemplos de Uso

### Exemplo 1: Cadastro de Usuário

```typescript
export const createUser = withActionWrapper(
  async (context, formData: FormData) => {
    const userData = {
      email: formData.get('email') as string,
      name: formData.get('name') as string,
      cpf: formData.get('cpf') as string,
    };

    // Se email já existir, retornará:
    // { success: false, error: { message: "Este e-mail já está cadastrado.", field: "email" } }
    
    const result = await db.insert(users).values(userData);
    return result;
  },
  {
    requireAuth: true,
    schema: createUserSchema,
    activityType: 'user.create'
  }
);
```

### Exemplo 2: Atualização com Validação

```typescript
export const updateAgency = withActionWrapper(
  async (context, agencyData) => {
    // Se CNPJ já existir em outra agência, retornará:
    // { success: false, error: { message: "Este CNPJ já está cadastrado.", field: "cnpj" } }
    
    const result = await db
      .update(agencies)
      .set(agencyData)
      .where(eq(agencies.id, context.agencyId!));
      
    return result;
  },
  {
    requireAuth: true,
    schema: updateAgencySchema,
    activityType: 'agency.update'
  }
);
```

### Exemplo 3: Exclusão com Referência

```typescript
export const deleteUser = withActionWrapper(
  async (context, userId: string) => {
    // Se usuário tiver registros relacionados, retornará:
    // { success: false, error: { message: "Este registro está sendo usado em outro lugar e não pode ser removido." } }
    
    await db.delete(users).where(eq(users.id, userId));
    return { success: true };
  },
  {
    requireAuth: true,
    activityType: 'user.delete'
  }
);
```

## Logs e Debugging

O sistema mantém logs detalhados dos erros originais:

```typescript
// Log automático quando erro de banco é tratado
{
  action: "createUser",
  args: [{ type: "FormData", keys: ["email", "name", "cpf"] }],
  options: { requireAuth: true, schema: "...", activityType: "user.create" },
  dbErrorHandled: true,
  originalDbCode: "23505"
}
```

## Configuração

### Adicionando Novos Mapeamentos

Para adicionar novos códigos de erro:

```typescript
// Em database-errors.ts
export const postgresErrorMap: Record<string, string> = {
  // ... mapeamentos existentes ...
  '42P99': 'Nova mensagem de erro personalizada.',
};
```

### Adicionando Campos Específicos

Para adicionar mensagens específicas para novos campos:

```typescript
// Em database-errors.ts
const fieldSpecificMessages: Record<string, string> = {
  // ... mensagens existentes ...
  'new_field': 'Este novo campo já está em uso.',
};
```

### Adicionando Nomes Amigáveis de Campos

Para NOT NULL violations:

```typescript
// Em database-errors.ts
function getFieldDisplayName(fieldName: string): string {
  const displayNames: Record<string, string> = {
    // ... nomes existentes ...
    'new_field': 'Novo Campo',
  };
  
  return displayNames[fieldName] || fieldName;
}
```

## Testes

O sistema inclui testes abrangentes:

```bash
# Executar testes específicos do tratamento de erros
npm test -- __tests__/services/error-handler/database-errors.test.ts

# Executar todos os testes
npm test
```

### Cobertura de Testes

- ✅ Mapeamento de códigos PostgreSQL
- ✅ Tratamento de violações de integridade
- ✅ Mensagens específicas por campo
- ✅ Casos extremos (erros nulos, códigos inválidos)
- ✅ Categorização de erros
- ✅ Verificação de tipo PostgreSQL

## Benefícios

1. **UX Melhorada**: Usuários recebem mensagens claras em português
2. **Debugging Facilitado**: Logs detalhados dos erros originais
3. **Manutenibilidade**: Centralização do tratamento de erros
4. **Flexibilidade**: Fácil adição de novos mapeamentos
5. **Robustez**: Tratamento seguro de casos extremos
6. **Integração Automática**: Funciona automaticamente com ActionWrapper

## Próximos Passos

1. **Monitoramento**: Implementar métricas para códigos de erro não mapeados
2. **Internacionalização**: Suporte para múltiplos idiomas
3. **Configuração**: Permitir personalização via variáveis de ambiente
4. **Performance**: Cache de mapeamentos para alta frequência
5. **Extensibilidade**: Suporte para outros SGBDs além do PostgreSQL
