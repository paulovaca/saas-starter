# Sistema de Modais Reutilizáveis

Este documento descreve o sistema unificado de modais implementado para substituir as múltiplas implementações existentes no aplicativo.

## 📋 Visão Geral

O sistema de modais foi criado para unificar 3 implementações diferentes existentes no projeto:
- Dialog customizado (`components/ui/dialog.tsx`)
- Radix UI Alert Dialog (`components/ui/alert-dialog.tsx`)
- Implementações diretas em componentes

### Benefícios
- ✅ **Consistência**: Interface padronizada para todos os modais
- ✅ **Acessibilidade**: Implementação completa de padrões ARIA
- ✅ **Flexibilidade**: Suporte a diferentes tamanhos e variantes
- ✅ **Manutenibilidade**: Código centralizado e reutilizável
- ✅ **Performance**: Focus trap e animações otimizadas

## 🔧 Componentes

### 1. Hook `useModal`

**Localização**: `lib/hooks/use-modal.ts`

Hook para gerenciamento de estado consistente dos modais.

```typescript
import { useModal } from '@/lib/hooks/use-modal';

const modal = useModal();

// Métodos disponíveis
modal.open();        // Abre o modal
modal.close();       // Fecha o modal
modal.toggle();      // Alterna estado
modal.setIsOpen(true); // Define estado diretamente
modal.isOpen;        // Estado atual (boolean)
```

### 2. Componente Base `Modal`

**Localização**: `components/ui/modal.tsx`

Componente base flexível que suporta diferentes configurações.

```typescript
import { Modal } from '@/components/ui/modal';

<Modal
  isOpen={modal.isOpen}
  onClose={modal.close}
  title="Título do Modal"
  description="Descrição opcional"
  size="md"                    // 'sm' | 'md' | 'lg' | 'xl' | 'full'
  variant="dialog"             // 'dialog' | 'alert' | 'form'
  loading={false}              // Estado de carregamento
  preventClose={false}         // Impede fechamento
  showCloseButton={true}       // Mostra botão X
  footer={<div>Footer customizado</div>}
>
  <p>Conteúdo do modal</p>
</Modal>
```

#### Propriedades

| Prop | Tipo | Padrão | Descrição |
|------|------|---------|-----------|
| `isOpen` | `boolean` | - | Estado de visibilidade |
| `onClose` | `() => void` | - | Callback de fechamento |
| `title` | `string` | - | Título do modal |
| `description` | `string` | - | Descrição opcional |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl' \| 'full'` | `'md'` | Tamanho do modal |
| `variant` | `'dialog' \| 'alert' \| 'form'` | `'dialog'` | Variante visual |
| `loading` | `boolean` | `false` | Estado de carregamento |
| `preventClose` | `boolean` | `false` | Impede fechamento |
| `showCloseButton` | `boolean` | `true` | Mostra botão fechar |
| `footer` | `ReactNode` | - | Conteúdo do rodapé |
| `className` | `string` | - | Classes CSS adicionais |

#### Tamanhos Disponíveis

- **sm**: 24rem (384px) - Para confirmações simples
- **md**: 32rem (512px) - Padrão para a maioria dos casos
- **lg**: 48rem (768px) - Para formulários complexos
- **xl**: 64rem (1024px) - Para conteúdo extenso
- **full**: Ocupa quase toda a tela

#### Variantes

- **dialog**: Modal padrão com bordas arredondadas
- **alert**: Modal de alerta com estilo centralizado
- **form**: Modal otimizado para formulários

### 3. Componente `FormModal`

**Localização**: `components/ui/form-modal.tsx`

Modal especializado para formulários com botões de ação padronizados.

```typescript
import { FormModal } from '@/components/ui/form-modal';

<FormModal
  isOpen={modal.isOpen}
  onClose={modal.close}
  title="Novo Usuário"
  onSubmit={handleSubmit}
  isSubmitting={isSubmitting}
  submitLabel="Criar Usuário"
  submitVariant="success"      // 'default' | 'destructive' | 'success'
  submitDisabled={!isValid}
>
  {/* Campos do formulário */}
</FormModal>
```

#### Propriedades Específicas

| Prop | Tipo | Padrão | Descrição |
|------|------|---------|-----------|
| `onSubmit` | `() => void \| Promise<void>` | - | Callback de submit |
| `onCancel` | `() => void` | - | Callback de cancelamento |
| `submitLabel` | `string` | `'Salvar'` | Texto do botão submit |
| `cancelLabel` | `string` | `'Cancelar'` | Texto do botão cancelar |
| `isSubmitting` | `boolean` | `false` | Estado de envio |
| `submitDisabled` | `boolean` | `false` | Desabilita submit |
| `submitVariant` | `'default' \| 'destructive' \| 'success'` | `'default'` | Estilo do botão |
| `showFooter` | `boolean` | `true` | Mostra rodapé com botões |

### 4. Componente `ConfirmModal`

**Localização**: `components/ui/confirm-modal.tsx`

Modal para confirmações e ações destrutivas.

```typescript
import { ConfirmModal } from '@/components/ui/confirm-modal';

<ConfirmModal
  isOpen={confirmModal.isOpen}
  onClose={confirmModal.close}
  title="Deletar Usuário"
  description="Esta ação não pode ser desfeita."
  onConfirm={handleDelete}
  variant="danger"                    // 'danger' | 'warning' | 'info'
  requiredConfirmation="DELETAR"     // Texto obrigatório
  confirmText="Confirmar Exclusão"
  isLoading={isDeleting}
/>
```

#### Propriedades Específicas

| Prop | Tipo | Padrão | Descrição |
|------|------|---------|-----------|
| `onConfirm` | `() => void \| Promise<void>` | - | Callback de confirmação |
| `variant` | `'danger' \| 'warning' \| 'info'` | `'danger'` | Tipo de alerta |
| `confirmText` | `string` | `'Confirmar'` | Texto do botão confirmar |
| `cancelText` | `string` | `'Cancelar'` | Texto do botão cancelar |
| `requiredConfirmation` | `string` | - | Texto obrigatório para confirmar |
| `confirmationPlaceholder` | `string` | `'Digite para confirmar'` | Placeholder do input |
| `isLoading` | `boolean` | `false` | Estado de carregamento |

## 🎨 Estilos e Animações

O sistema utiliza CSS Modules (`modal.module.css`) com:

- **Animações suaves**: fadeIn para overlay, slideIn para conteúdo
- **Design responsivo**: Adaptação automática para mobile
- **Estados visuais**: Loading, hover, focus, disabled
- **Cores contextuais**: Diferentes para cada variante

### Variáveis CSS Personalizáveis

```css
/* Cores do tema */
--modal-overlay: rgba(0, 0, 0, 0.5);
--modal-background: white;
--modal-border: #e5e7eb;
--modal-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);

/* Animações */
--modal-animation-duration: 0.2s;
--modal-animation-easing: ease-out;
```

## 📱 Acessibilidade

O sistema implementa todos os padrões ARIA:

- **Focus trap**: Foco permanece dentro do modal
- **Escape key**: Fecha modal (quando permitido)
- **Aria labels**: `aria-modal`, `aria-labelledby`, `aria-describedby`
- **Role dialog**: Semântica correta
- **Focus restoration**: Retorna foco ao elemento anterior

## 🚀 Exemplos de Uso

### Modal Básico

```typescript
import { useModal } from '@/lib/hooks/use-modal';
import { Modal, Button } from '@/components/ui';

function MyComponent() {
  const modal = useModal();

  return (
    <>
      <Button onClick={modal.open}>Abrir Modal</Button>
      
      <Modal
        isOpen={modal.isOpen}
        onClose={modal.close}
        title="Informações"
        description="Detalhes importantes"
      >
        <p>Conteúdo do modal...</p>
      </Modal>
    </>
  );
}
```

### Formulário com Validação

```typescript
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormModal, Input, Label } from '@/components/ui';

const schema = z.object({
  name: z.string().min(1, 'Nome obrigatório'),
  email: z.string().email('Email inválido'),
});

function UserFormModal() {
  const modal = useModal();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: z.infer<typeof schema>) => {
    setIsSubmitting(true);
    try {
      await createUser(data);
      modal.close();
      form.reset();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormModal
      isOpen={modal.isOpen}
      onClose={modal.close}
      title="Novo Usuário"
      onSubmit={form.handleSubmit(onSubmit)}
      isSubmitting={isSubmitting}
      submitDisabled={!form.formState.isValid}
    >
      <form className="space-y-4">
        <div>
          <Label htmlFor="name">Nome</Label>
          <Input {...form.register('name')} />
          {form.formState.errors.name && (
            <span className="text-red-500 text-sm">
              {form.formState.errors.name.message}
            </span>
          )}
        </div>
        
        <div>
          <Label htmlFor="email">Email</Label>
          <Input type="email" {...form.register('email')} />
          {form.formState.errors.email && (
            <span className="text-red-500 text-sm">
              {form.formState.errors.email.message}
            </span>
          )}
        </div>
      </form>
    </FormModal>
  );
}
```

### Confirmação de Exclusão

```typescript
import { useState } from 'react';
import { ConfirmModal, Button } from '@/components/ui';

function DeleteUserButton({ userId, userName }) {
  const confirmModal = useModal();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteUser(userId);
      toast.success('Usuário deletado com sucesso');
    } catch (error) {
      toast.error('Erro ao deletar usuário');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Button 
        variant="destructive" 
        onClick={confirmModal.open}
      >
        Deletar Usuário
      </Button>
      
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={confirmModal.close}
        title="Deletar Usuário"
        description={`Tem certeza que deseja deletar ${userName}? Esta ação não pode ser desfeita.`}
        requiredConfirmation={userName}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        variant="danger"
      />
    </>
  );
}
```

## 🔄 Migração de Modais Existentes

### Substituindo Dialog Customizado

**Antes:**
```typescript
import { Dialog } from '@/components/ui/dialog';

<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Título</DialogTitle>
    </DialogHeader>
    <div>Conteúdo</div>
  </DialogContent>
</Dialog>
```

**Depois:**
```typescript
import { Modal } from '@/components/ui/modal';
import { useModal } from '@/lib/hooks/use-modal';

const modal = useModal();

<Modal
  isOpen={modal.isOpen}
  onClose={modal.close}
  title="Título"
>
  <div>Conteúdo</div>
</Modal>
```

### Substituindo Implementações Diretas

**Antes:**
```typescript
{isModalOpen && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
    <div className="bg-white p-6 rounded-lg">
      <h2>Título</h2>
      <div>Conteúdo</div>
      <button onClick={() => setIsModalOpen(false)}>Fechar</button>
    </div>
  </div>
)}
```

**Depois:**
```typescript
<Modal
  isOpen={modal.isOpen}
  onClose={modal.close}
  title="Título"
>
  <div>Conteúdo</div>
</Modal>
```

## 🧪 Testes

Uma página de testes foi criada em `app/test-modals/page.tsx` para demonstrar todos os tipos de modal:

- Modal básico com diferentes tamanhos
- FormModal com formulário funcional
- ConfirmModal simples
- ConfirmModal com confirmação por texto

Para testar, acesse: `/test-modals`

## 📦 Exportações

Todos os componentes estão disponíveis através do index:

```typescript
import { 
  Modal, 
  FormModal, 
  ConfirmModal,
  useModal 
} from '@/components/ui';
```

## 🔧 Personalização

O sistema permite personalização através de:

1. **Props**: Todas as propriedades são configuráveis
2. **CSS Classes**: Adicione classes personalizadas via `className`
3. **CSS Variables**: Modifique cores e animações
4. **Composição**: Combine com outros componentes

## 📚 Próximos Passos

1. **Migração gradual**: Substituir modais existentes um por vez
2. **Documentação adicional**: Criar Storybook para visualização
3. **Testes unitários**: Implementar testes para todos os componentes
4. **Melhorias futuras**: Adicionar mais variantes conforme necessário

## 🐛 Problemas Conhecidos

Nenhum problema conhecido no momento. Para reportar bugs ou sugerir melhorias, criar issue no repositório.