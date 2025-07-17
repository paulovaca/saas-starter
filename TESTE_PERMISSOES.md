# 🔒 Teste de Permissões - Funções Administrativas

## Comportamento Esperado

### 👑 MASTER e ADMIN
**Devem ver na barra lateral:**
- **Navegação Principal:**
  - Dashboard
  - Clientes
  - Propostas 
  - Relatórios

- **Funções Administrativas:**
  - Usuários
  - Funis de Venda
  - Itens Base
  - Operadoras

### 👤 AGENT
**Devem ver apenas:**
- **Navegação Principal:**
  - Dashboard
  - Clientes
  - Propostas
  - Relatórios

**NÃO devem ver:**
- O título "Funções Administrativas"
- Nenhum dos itens administrativos

## Proteção de Rotas

### ✅ Rotas Protegidas (apenas MASTER/ADMIN)
- `/users` 
- `/funnels`
- `/catalog`
- `/operators`
- `/operators/[id]`

### ⚠️ Testes a Fazer
1. **Login como AGENT**: verificar se não vê itens administrativos
2. **Tentar acessar rota protegida como AGENT**: deve redirecionar para `/`
3. **Login como ADMIN**: verificar se vê todas as funções
4. **Login como MASTER**: verificar se vê todas as funções

## Logs de Teste
- [ ] Agente não vê "Funções Administrativas"
- [ ] Agente não vê link para Operadoras
- [ ] Agente redirecionado ao tentar `/operators`
- [ ] Admin vê separação correta na navegação
- [ ] Master vê separação correta na navegação
