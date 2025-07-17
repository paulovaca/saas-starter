Collecting workspace information# 📚 Manual do Módulo de Operadoras - CRM Travel SaaS

## 📋 Índice
1. Visão Geral
2. Permissões e Acessos
3. Funcionalidades
4. Estrutura de Dados
5. Fluxos de Trabalho
6. Regras de Negócio
7. Guia do Usuário
8. Guia do Desenvolvedor

## 🎯 Visão Geral

O módulo de Operadoras é um componente fundamental do CRM Travel SaaS que permite o gerenciamento de fornecedores/parceiros comerciais. As operadoras são empresas que fornecem produtos e serviços (como passagens aéreas, hospedagens, pacotes turísticos) que a agência comercializa para seus clientes.

### Conceitos Principais

- **Operadora**: Empresa fornecedora de produtos/serviços turísticos
- **Item Base**: Produto genérico do catálogo (ex: "Passagem Aérea", "Hospedagem")
- **Item da Operadora**: Item Base associado a uma operadora específica com regras de comissionamento
- **Comissionamento**: Percentual ou valor fixo que a agência recebe por venda

## 🔐 Permissões e Acessos

### Níveis de Acesso

| Perfil | Visualizar | Criar | Editar | Excluir | Gerenciar Comissões |
|--------|------------|-------|--------|---------|---------------------|
| Master | ✅ | ✅ | ✅ | ✅ | ✅ |
| Admin | ✅ | ✅ | ✅ | ✅ | ✅ |
| Agent | ✅ | ❌ | ❌ | ❌ | ❌ |

### Restrições
- Agentes podem apenas visualizar operadoras ativas para criar propostas
- Apenas Master/Admin podem acessar configurações de comissionamento
- Documentos confidenciais são visíveis apenas para Master/Admin

## 🛠️ Funcionalidades

### 1. Gestão de Operadoras

#### 1.1 Cadastro de Operadora
- **Dados Básicos**: Nome, CNPJ, Logo
- **Contato**: Nome do responsável, Email, Telefone
- **Endereço**: Completo com CEP
- **Observações**: Notas internas

#### 1.2 Status da Operadora
- **Ativa**: Disponível para uso em propostas
- **Inativa**: Não aparece nas seleções mas mantém histórico

### 2. Portfólio de Produtos

#### 2.1 Associação de Itens Base
- Selecionar itens do catálogo geral
- Definir nome customizado para a operadora
- Configurar disponibilidade (ativo/inativo)

#### 2.2 Configuração de Comissionamento
Cada item pode ter diferentes regras de comissão baseadas em:
- **Forma de Pagamento**: PIX, Cartão, Boleto
- **Faixas de Valor**: Comissões escalonadas
- **Tipo de Comissão**: Percentual ou valor fixo

### 3. Gestão de Documentos

- Upload de contratos de parceria
- Tabelas de preços
- Material de marketing
- Controle de versões e histórico

### 4. Indicadores e Métricas

- Número de itens ativos
- Total de propostas no mês
- Total de reservas ativas
- Volume de vendas

## 🗄️ Estrutura de Dados

### Tabela: operators
```typescript
{
  id: string
  name: string
  logo: string
  cnpj: string
  contactName: string
  contactEmail: string
  contactPhone: string
  address: object
  notes: text
  agencyId: string
  isActive: boolean
  createdAt: timestamp
  updatedAt: timestamp
}
```

### Tabela: operator_items
```typescript
{
  id: string
  operatorId: string
  catalogItemId: string
  customName: string
  customValues: json
  commissionType: enum
  isActive: boolean
}
```

### Tabela: commission_rules
```typescript
{
  id: string
  operatorItemId: string
  ruleType: string
  paymentMethod: string
  minValue: decimal
  maxValue: decimal
  percentage: decimal
  fixedValue: decimal
  conditions: json
}
```

## 🔄 Fluxos de Trabalho

### Fluxo 1: Cadastrar Nova Operadora

1. **Master/Admin** acessa menu "Operadoras"
2. Clica em "Nova Operadora"
3. Preenche dados cadastrais
4. Salva operadora (status inicial: inativa)
5. Sistema registra log de criação

### Fluxo 2: Configurar Portfólio

1. Acessa detalhes da operadora
2. Navega para aba "Itens Base"
3. Clica em "Adicionar Item Base"
4. Seleciona item do catálogo
5. Define nome customizado (opcional)
6. Configura comissionamento por forma de pagamento
7. Salva configuração

### Fluxo 3: Ativar Operadora

1. Operadora deve ter pelo menos 1 item ativo
2. Master/Admin altera status para "Ativa"
3. Operadora fica disponível para propostas
4. Sistema notifica agentes (opcional)

## 📏 Regras de Negócio

### Validações

1. **CNPJ**: Deve ser válido e único no sistema
2. **Email/Telefone**: Formatos válidos brasileiros
3. **Comissões**: Não podem ter faixas sobrepostas
4. **Ativação**: Requer pelo menos um produto ativo
5. **Exclusão**: Impedida se houver propostas/reservas vinculadas

### Cálculo de Comissões

```typescript
// Exemplo de cálculo
valorVenda = 1000.00
formaPagamento = "PIX"
comissao = 15% // configurada para PIX

valorComissao = valorVenda * (comissao / 100)
// Resultado: R$ 150,00
```

### Regras Especiais

- Um mesmo Item Base pode estar em várias operadoras
- Cada associação pode ter comissionamento diferente
- Comissões podem ser:
  - Percentual simples
  - Percentual escalonado por faixa
  - Valor fixo por venda
  - Combinação de percentual + bônus

## 👤 Guia do Usuário

### Para Administradores

#### Criar Operadora
1. Acesse **Operadoras** no menu lateral
2. Clique em **Nova Operadora**
3. Preencha os dados em cada aba
4. Clique em **Salvar**

#### Configurar Produtos
1. Entre nos detalhes da operadora
2. Vá para aba **Itens Base**
3. Clique em **Adicionar Item**
4. Configure comissões para cada forma de pagamento
5. Ative o item quando pronto

#### Gerenciar Documentos
1. Na aba **Documentos**
2. Arraste arquivos ou clique para upload
3. Organize por tipo de documento
4. Mantenha versões atualizadas

### Para Agentes

#### Consultar Operadoras
1. Acesse **Operadoras** para ver lista
2. Use filtros para encontrar específicas
3. Veja produtos disponíveis
4. Consulte tabelas de comissão (se permitido)

## 💻 Guia do Desenvolvedor

### Estrutura de Arquivos

```
app/(dashboard)/operators/
├── page.tsx                    # Listagem de operadoras
├── [operatorId]/
│   ├── page.tsx               # Detalhes da operadora
│   └── products/
│       └── page.tsx           # Gestão de itens

components/operators/
├── operator-form-modal.tsx     # Modal de criação/edição
├── operator-card.tsx          # Card de operadora
├── item-association.tsx       # Associar itens
├── commission-editor.tsx      # Editor de comissões
└── document-upload.tsx        # Upload de documentos

lib/
├── actions/operators/         # Server actions
├── validations/operators/     # Schemas Zod
└── db/schema/operators/       # Schemas do banco
```

### Actions Principais

```typescript
// Criar operadora
createOperator(data: OperatorInput): Promise<Operator>

// Associar item
associateItems(operatorId: string, items: ItemAssociation[]): Promise<void>

// Calcular comissão
calculateCommission(
  operatorItemId: string, 
  amount: number, 
  paymentMethod: string
): Promise<CommissionResult>
```

### Validações

```typescript
// Schema de operadora
const operatorSchema = z.object({
  name: z.string().min(3),
  cnpj: cnpjSchema,
  contactEmail: z.string().email(),
  contactPhone: phoneSchema,
  // ...
})

// Schema de comissão
const commissionSchema = z.object({
  ruleType: z.enum(['percentage', 'fixed', 'tiered']),
  paymentMethod: z.string(),
  percentage: z.number().min(0).max(100).optional(),
  fixedValue: z.number().min(0).optional(),
  // ...
})
```

### Hooks Úteis

```typescript
// Verificar permissões
const { canManageOperators } = usePermissions()

// Buscar operadoras
const { operators, isLoading } = useOperators({
  isActive: true,
  hasItems: true
})

// Calcular comissão em tempo real
const commission = useCommissionCalculator(
  operatorItemId,
  amount,
  paymentMethod
)
```

### Integração com Outros Módulos

1. **Catálogo**: Operadoras consomem itens base
2. **Propostas**: Utilizam operadoras e seus produtos
3. **Financeiro**: Comissões alimentam relatórios
4. **Logs**: Todas ações são registradas

### Boas Práticas

1. **Performance**: 
   - Use paginação em listagens
   - Cache dados de operadoras ativas
   - Lazy load documentos pesados

2. **Segurança**:
   - Valide CNPJ no backend
   - Sanitize uploads de documentos
   - Verifique permissões em todas actions

3. **UX**:
   - Feedback visual em ações demoradas
   - Confirmação antes de desativar
   - Preview de comissões ao configurar

---

## 📞 Suporte

Para dúvidas sobre o módulo de Operadoras:
- Consulte a documentação técnica em `/diretrizes`
- Verifique os logs de sistema para debugging
- Entre em contato com a equipe de desenvolvimento