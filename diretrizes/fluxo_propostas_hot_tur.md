
# 🧾 Fluxo de Propostas e Reservas — Hot Tur CRM

### 📅 Atualizado em: 07/08/2025

## 🧩 Visão Geral do Fluxo

Este documento define o fluxo completo das propostas comerciais criadas pelos agentes no CRM, desde o rascunho até a conclusão como reserva ativa. Também define os estados intermediários e suas transições permitidas.

---

## 🔄 Etapas e Transições Permitidas

### 1. **Rascunho**
- **Descrição**: Proposta em fase de edição/criação pelo agente.
- **Transições permitidas**:
  - Enviada
  - Cancelada (se for abandonada)
- **Campos disponíveis**:
  - Cliente
  - Data de validade da proposta (para controle e expiração futura)
  - Produtos

---

### 2. **Enviada**
- **Descrição**: Proposta enviada para o cliente por WhatsApp ou outro canal.
- **Ações automáticas**:
  - Iniciar contador de tempo para expiração automática de acordo com data de validade.
  - Registro de data de envio.
- **Transições permitidas**:
  - Aprovada (botão de aprovada - quando clicado vira automaticamente "contrato")
  - Recusada
  - Expirada (automático após X dias sem resposta)
  - Cancelada (pelo agente)

---

### 3. **Expirada**
- **Descrição**: Proposta enviada que não teve retorno do cliente dentro do prazo.
- **Transições permitidas**:
  - Reativar → volta para Rascunho

---

### 4. **Recusada**
- **Descrição**: Cliente recusou a proposta e o agente registrou como recusada.
- **Ações obrigatórias**:
  - Registro de motivo da recusa (campo obrigatório com opções pré-definidas + campo "Outro").
- **Transições permitidas**:
  - Reativar → volta para Rascunho
  - Cancelada

---

### 5. **Aprovada**
- **Descrição**: Cliente aceitou a proposta. E ela se torna automaticamente Contrato

---

### 6. **Contrato**
- **Descrição**: Fase de coleta de dados do cliente e geração do contrato.
- **Funcionalidades nesta etapa**:
  - Formulário para preenchimento dos dados do cliente e dados da reserva.
  - Geração do contrato personalizado. (pode gerar e alterar dados sempre que precisar)
  - Envio do contrato para conferência (geralmente por WhatsApp).
  - Anexar evidência de aprovação informal (ex: print de conversa).
  - (acredito ser necessário criação de campos no banco de dados para manejar essas etapas)
- **Transições permitidas**:
  - Aguardando Pagamento
  - Cancelada

---

### 7. **Aguardando Pagamento**
- **Descrição**: Cliente aprovou o contrato, falta realizar o pagamento.
- **Transições permitidas**:
  - Reserva Ativa
  - Cancelada

---

### 8. **Reserva Ativa**
- **Descrição**: Pagamento confirmado e reserva oficializada.
- **Ações automáticas**:
  - Registro da data de confirmação.
  - Transição da proposta para o sistema de reservas (página específica).
- **Transições permitidas**:
  - Cancelada (em caso de desistência ou reembolso)

---

### 9. **Cancelada**
- **Descrição**: Proposta/projeto cancelado por qualquer motivo.
- **Ações obrigatórias**:
  - Registro do motivo do cancelamento.
  - Proposta pode ser arquivada para histórico.

---

## 📋 Regras de Implementação

### 🔁 Histórico de Transições
Cada mudança de status deve ser registrada com:
- Nome do agente
- Data/hora
- Status anterior e novo
- Observação (opcional)

### ⏳ Expiração Automática
- Propostas no status "Enviada" viram "Expirada" casoa atinja a data de expiração.

### 🔄 Reativação
- Propostas "Expirada" ou "Recusada" podem ser reativadas manualmente, voltando a "Rascunho".

### 🧾 Motivos de Recusa e Cancelamento
- Listas gerenciáveis pelo administrador.

### 📑 Duplicar Proposta
- Qualquer proposta pode ser duplicada, gerando um novo rascunho com os mesmos dados.

---
### Exclusão - Master pode excluir definitivamente a proposta


## 🔄 Fluxo Resumido

```
Rascunho 
  └──> Enviada 
         |  └──> Contrato 
         │          └──> Aguardando Pagamento 
         │                   └──> Reserva Ativa 
         ├──> Recusada → Reativar → Rascunho
         ├──> Expirada → Reativar → Rascunho
         └──> Cancelada (a qualquer momento)
```
