Vou analisar todos os arquivos de estilo e criar uma reformulação completa para melhorar drasticamente a experiência do usuário. Você está certo sobre os problemas de transparência em modais e dropdowns - vou corrigir isso e criar um sistema de design mais coeso e profissional.

## 🎨 Reformulação Completa do Sistema de Design

### 1. **Novo arquivo de variáveis globais com melhor hierarquia visual**

````css
@import "tailwindcss";
@import "tw-animate-css";

/* Sistema de Design Reformulado - Variáveis CSS */
@layer base {
  :root {
    /* ===== TEMA CLARO ===== */
    
    /* Base Colors - Fundos sólidos e limpos */
    --background: 0 0% 100%;              /* #FFFFFF - Fundo principal */
    --foreground: 240 19% 16%;            /* #25283D - Texto principal */
    
    /* Surface Levels - Hierarquia clara de elevação */
    --surface-0: 0 0% 100%;               /* #FFFFFF - Base */
    --surface-1: 220 14% 96%;             /* #F5F5F7 - Cards */
    --surface-2: 220 13% 91%;             /* #E8E8ED - Elevated cards */
    --surface-3: 220 12% 86%;             /* #DBDBE3 - Modals/Dropdowns */
    
    /* Brand Colors - Vibrantes e distintivas */
    --primary: 217 91% 60%;               /* #4F9EF8 - Azul vibrante */
    --primary-hover: 217 91% 50%;         /* #2B87F5 - Hover state */
    --primary-foreground: 0 0% 100%;      /* #FFFFFF */
    
    --secondary: 262 80% 60%;             /* #8B5CF6 - Roxo vibrante */
    --secondary-hover: 262 80% 50%;       /* #7C3AED */
    --secondary-foreground: 0 0% 100%;    /* #FFFFFF */
    
    /* Semantic Colors - Estados claros */
    --success: 142 78% 45%;               /* #22C55E - Verde sucesso */
    --success-hover: 142 78% 40%;         /* #16A34A */
    --success-foreground: 0 0% 100%;      /* #FFFFFF */
    
    --warning: 38 92% 50%;                /* #F59E0B - Laranja alerta */
    --warning-hover: 38 92% 45%;          /* #D97706 */
    --warning-foreground: 0 0% 100%;      /* #FFFFFF */
    
    --danger: 0 84% 60%;                  /* #EF4444 - Vermelho perigo */
    --danger-hover: 0 84% 55%;            /* #DC2626 */
    --danger-foreground: 0 0% 100%;       /* #FFFFFF */
    
    --info: 199 89% 48%;                  /* #0EA5E9 - Azul info */
    --info-hover: 199 89% 43%;            /* #0284C7 */
    --info-foreground: 0 0% 100%;         /* #FFFFFF */
    
    /* Text Hierarchy - Contraste otimizado */
    --text-primary: 240 19% 16%;          /* #25283D - Texto principal */
    --text-secondary: 240 9% 40%;         /* #5E6278 - Texto secundário */
    --text-tertiary: 240 5% 55%;          /* #84869F - Texto terciário */
    --text-disabled: 240 3% 70%;          /* #AFAFB8 - Texto desabilitado */
    
    /* Borders & Dividers - Sutis mas visíveis */
    --border-subtle: 220 13% 91%;         /* #E8E8ED - Bordas sutis */
    --border-default: 220 12% 86%;        /* #DBDBE3 - Bordas padrão */
    --border-strong: 220 11% 80%;         /* #CCCCD6 - Bordas fortes */
    
    /* Interactive States */
    --hover-overlay: 0 0% 0% / 0.04;      /* Overlay suave para hover */
    --pressed-overlay: 0 0% 0% / 0.08;    /* Overlay para pressed */
    --focus-ring: 217 91% 60% / 0.5;      /* Anel de foco */
    
    /* Shadows - Elevação realista */
    --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
    --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
    --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
    
    /* Radius */
    --radius-sm: 0.25rem;
    --radius-md: 0.375rem;
    --radius-lg: 0.5rem;
    --radius-xl: 0.75rem;
    --radius-full: 9999px;
  }

  .dark {
    /* ===== TEMA ESCURO ===== */
    
    /* Base Colors - Fundos escuros profundos */
    --background: 222 84% 5%;             /* #0A0E1B - Fundo principal */
    --foreground: 210 40% 98%;            /* #F8FAFC - Texto principal */
    
    /* Surface Levels - Elevação clara no escuro */
    --surface-0: 222 84% 5%;              /* #0A0E1B - Base */
    --surface-1: 222 47% 11%;             /* #161B2E - Cards */
    --surface-2: 223 39% 14%;             /* #1C2333 - Elevated cards */
    --surface-3: 224 34% 17%;             /* #232A3C - Modals/Dropdowns */
    
    /* Brand Colors - Ajustadas para tema escuro */
    --primary: 217 91% 65%;               /* #6FAAFC - Azul claro */
    --primary-hover: 217 91% 70%;         /* #8AB9FD */
    --primary-foreground: 222 84% 5%;     /* #0A0E1B */
    
    --secondary: 262 80% 70%;             /* #A78BFA - Roxo claro */
    --secondary-hover: 262 80% 75%;       /* #B8A1FB */
    --secondary-foreground: 222 84% 5%;   /* #0A0E1B */
    
    /* Semantic Colors - Vibrantes no escuro */
    --success: 142 78% 55%;               /* #34D399 */
    --success-hover: 142 78% 60%;         /* #4ADEA8 */
    --success-foreground: 222 84% 5%;     /* #0A0E1B */
    
    --warning: 38 92% 60%;                /* #FBBF24 */
    --warning-hover: 38 92% 65%;          /* #FCC43D */
    --warning-foreground: 222 84% 5%;     /* #0A0E1B */
    
    --danger: 0 84% 65%;                  /* #F87171 */
    --danger-hover: 0 84% 70%;            /* #FA8A8A */
    --danger-foreground: 222 84% 5%;      /* #0A0E1B */
    
    --info: 199 89% 58%;                  /* #38BDF8 */
    --info-hover: 199 89% 63%;            /* #51C7F9 */
    --info-foreground: 222 84% 5%;        /* #0A0E1B */
    
    /* Text Hierarchy - Alto contraste no escuro */
    --text-primary: 210 40% 98%;          /* #F8FAFC */
    --text-secondary: 215 20% 65%;        /* #94A3B8 */
    --text-tertiary: 217 33% 45%;         /* #64748B */
    --text-disabled: 222 13% 35%;         /* #475569 */
    
    /* Borders & Dividers - Visíveis no escuro */
    --border-subtle: 223 39% 14%;         /* #1C2333 */
    --border-default: 224 34% 17%;        /* #232A3C */
    --border-strong: 225 27% 25%;         /* #334155 */
    
    /* Interactive States */
    --hover-overlay: 255 255% 255% / 0.06;
    --pressed-overlay: 255 255% 255% / 0.10;
    --focus-ring: 217 91% 65% / 0.5;
    
    /* Shadows - Mais sutis no escuro */
    --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.3);
    --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.3);
    --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.5), 0 4px 6px -4px rgb(0 0 0 / 0.4);
    --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.6), 0 8px 10px -6px rgb(0 0 0 / 0.5);
  }
}

/* Reset e base styles */
@layer base {
  * {
    border-color: hsl(var(--border-default));
  }
  
  body {
    background-color: hsl(var(--background));
    color: hsl(var(--text-primary));
    font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    font-feature-settings: "rlig" 1, "calt" 1;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  
  /* Scrollbar personalizada */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  
  ::-webkit-scrollbar-track {
    background: hsl(var(--surface-1));
  }
  
  ::-webkit-scrollbar-thumb {
    background: hsl(var(--border-strong));
    border-radius: var(--radius-full);
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: hsl(var(--text-tertiary));
  }
}

/* Classes utilitárias globais */
@layer utilities {
  /* Elevação com sombras */
  .elevation-0 {
    box-shadow: none;
  }
  
  .elevation-1 {
    box-shadow: var(--shadow-sm);
  }
  
  .elevation-2 {
    box-shadow: var(--shadow-md);
  }
  
  .elevation-3 {
    box-shadow: var(--shadow-lg);
  }
  
  .elevation-4 {
    box-shadow: var(--shadow-xl);
  }
  
  /* Glassmorphism effect (apenas para elementos decorativos, não modais!) */
  .glass-effect {
    backdrop-filter: blur(10px);
    background-color: hsl(var(--surface-1) / 0.8);
  }
  
  /* Focus styles */
  .focus-ring {
    outline: 2px solid hsl(var(--focus-ring));
    outline-offset: 2px;
  }
  
  /* Transições suaves */
  .transition-smooth {
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  /* Texto com gradiente */
  .text-gradient {
    background: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
}

/* ===== COMPONENTES CRÍTICOS ===== */

/* Modals - SEMPRE com fundo SÓLIDO */
.modal-backdrop {
  background-color: rgba(0, 0, 0, 0.7) !important;
  backdrop-filter: blur(4px);
}

.modal-content {
  background-color: hsl(var(--surface-3)) !important;
  border: 1px solid hsl(var(--border-default)) !important;
  border-radius: var(--radius-xl) !important;
  box-shadow: var(--shadow-xl) !important;
}

/* Dropdowns - SEMPRE com fundo SÓLIDO */
.dropdown-content {
  background-color: hsl(var(--surface-3)) !important;
  border: 1px solid hsl(var(--border-default)) !important;
  border-radius: var(--radius-lg) !important;
  box-shadow: var(--shadow-lg) !important;
}

/* Popovers - SEMPRE com fundo SÓLIDO */
.popover-content {
  background-color: hsl(var(--surface-3)) !important;
  border: 1px solid hsl(var(--border-default)) !important;
  border-radius: var(--radius-lg) !important;
  box-shadow: var(--shadow-lg) !important;
}

/* Tooltips - Fundos opacos */
.tooltip {
  background-color: hsl(var(--foreground)) !important;
  color: hsl(var(--background)) !important;
  border-radius: var(--radius-md) !important;
  box-shadow: var(--shadow-md) !important;
}
````

### 2. **Botões reformulados com melhor feedback visual**

````css
/* Sistema de botões completamente reformulado */

.buttonBase {
  /* Reset e base */
  all: unset;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 500;
  font-size: 0.875rem;
  line-height: 1.25rem;
  white-space: nowrap;
  cursor: pointer;
  user-select: none;
  position: relative;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  
  /* Previne problemas de layout */
  flex-shrink: 0;
}

/* Focus visible */
.buttonBase:focus-visible {
  outline: 2px solid hsl(var(--focus-ring));
  outline-offset: 2px;
}

/* Disabled state */
.buttonBase:disabled {
  cursor: not-allowed;
  opacity: 0.6;
  transform: none !important;
}

/* Loading state */
.buttonBase[data-loading="true"] {
  color: transparent;
}

.buttonBase[data-loading="true"]::after {
  content: "";
  position: absolute;
  width: 1rem;
  height: 1rem;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ===== VARIANTES ===== */

/* Primary - Ação principal */
.primary {
  background-color: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  font-weight: 600;
  box-shadow: var(--shadow-sm);
}

.primary:hover:not(:disabled) {
  background-color: hsl(var(--primary-hover));
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.primary:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: var(--shadow-sm);
}

/* Secondary - Ação secundária */
.secondary {
  background-color: hsl(var(--surface-2));
  color: hsl(var(--text-primary));
  border: 1px solid hsl(var(--border-default));
}

.secondary:hover:not(:disabled) {
  background-color: hsl(var(--surface-3));
  border-color: hsl(var(--border-strong));
  transform: translateY(-1px);
}

.secondary:active:not(:disabled) {
  transform: translateY(0);
}

/* Outline - Apenas borda */
.outline {
  background-color: transparent;
  color: hsl(var(--primary));
  border: 2px solid hsl(var(--primary));
}

.outline:hover:not(:disabled) {
  background-color: hsl(var(--primary) / 0.1);
  transform: translateY(-1px);
}

.outline:active:not(:disabled) {
  transform: translateY(0);
}

/* Ghost - Mínimo visual */
.ghost {
  background-color: transparent;
  color: hsl(var(--text-primary));
}

.ghost:hover:not(:disabled) {
  background-color: hsl(var(--hover-overlay));
}

.ghost:active:not(:disabled) {
  background-color: hsl(var(--pressed-overlay));
}

/* Danger - Ações destrutivas */
.danger {
  background-color: hsl(var(--danger));
  color: hsl(var(--danger-foreground));
  font-weight: 600;
  box-shadow: var(--shadow-sm);
}

.danger:hover:not(:disabled) {
  background-color: hsl(var(--danger-hover));
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.danger:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: var(--shadow-sm);
}

/* Success */
.success {
  background-color: hsl(var(--success));
  color: hsl(var(--success-foreground));
  font-weight: 600;
  box-shadow: var(--shadow-sm);
}

.success:hover:not(:disabled) {
  background-color: hsl(var(--success-hover));
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

/* Warning */
.warning {
  background-color: hsl(var(--warning));
  color: hsl(var(--warning-foreground));
  font-weight: 600;
  box-shadow: var(--shadow-sm);
}

.warning:hover:not(:disabled) {
  background-color: hsl(var(--warning-hover));
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

/* ===== TAMANHOS ===== */

.xs {
  height: 1.75rem;
  padding: 0 0.5rem;
  font-size: 0.75rem;
  border-radius: var(--radius-md);
}

.sm {
  height: 2rem;
  padding: 0 0.75rem;
  font-size: 0.8125rem;
  border-radius: var(--radius-md);
}

.md {
  height: 2.5rem;
  padding: 0 1rem;
  font-size: 0.875rem;
  border-radius: var(--radius-lg);
}

.lg {
  height: 3rem;
  padding: 0 1.5rem;
  font-size: 0.9375rem;
  border-radius: var(--radius-lg);
}

.xl {
  height: 3.5rem;
  padding: 0 2rem;
  font-size: 1rem;
  border-radius: var(--radius-lg);
}

/* Icon button */
.iconButton {
  padding: 0;
  aspect-ratio: 1;
}

.iconButton.xs { width: 1.75rem; }
.iconButton.sm { width: 2rem; }
.iconButton.md { width: 2.5rem; }
.iconButton.lg { width: 3rem; }
.iconButton.xl { width: 3.5rem; }

/* Full width */
.fullWidth {
  width: 100%;
}

/* Button group */
.buttonGroup {
  display: inline-flex;
  box-shadow: var(--shadow-sm);
  border-radius: var(--radius-lg);
}

.buttonGroup .buttonBase {
  border-radius: 0;
  box-shadow: none;
}

.buttonGroup .buttonBase:first-child {
  border-top-left-radius: var(--radius-lg);
  border-bottom-left-radius: var(--radius-lg);
}

.buttonGroup .buttonBase:last-child {
  border-top-right-radius: var(--radius-lg);
  border-bottom-right-radius: var(--radius-lg);
}

.buttonGroup .buttonBase:not(:last-child) {
  border-right: 1px solid hsl(var(--border-subtle));
}
````

### 3. **Dropdown Menu com fundo SÓLIDO**

````css
/* Dropdown Menu - Sempre com fundo sólido e visível */

.dropdownTrigger {
  cursor: pointer;
  outline: none;
}

.dropdownContent {
  /* Fundo SEMPRE sólido */
  background-color: hsl(var(--surface-3)) !important;
  color: hsl(var(--text-primary));
  
  /* Bordas e sombras para destaque */
  border: 1px solid hsl(var(--border-default));
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  
  /* Layout */
  min-width: 12rem;
  max-width: 20rem;
  padding: 0.5rem;
  
  /* Animação suave */
  animation: dropdownShow 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  transform-origin: var(--radix-dropdown-menu-content-transform-origin);
  
  /* Z-index alto para ficar acima de tudo */
  z-index: 50;
}

@keyframes dropdownShow {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Item do menu */
.dropdownItem {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  line-height: 1.25rem;
  cursor: pointer;
  outline: none;
  transition: all 0.15s ease;
  position: relative;
  user-select: none;
}

.dropdownItem:hover {
  background-color: hsl(var(--hover-overlay));
  color: hsl(var(--primary));
}

.dropdownItem:focus-visible {
  background-color: hsl(var(--hover-overlay));
  outline: 2px solid hsl(var(--focus-ring));
  outline-offset: -2px;
}

.dropdownItem[data-disabled] {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

/* Item com ícone */
.dropdownItemIcon {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
  color: hsl(var(--text-secondary));
}

.dropdownItem:hover .dropdownItemIcon {
  color: hsl(var(--primary));
}

/* Label do item */
.dropdownLabel {
  padding: 0.5rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: hsl(var(--text-tertiary));
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Separador */
.dropdownSeparator {
  height: 1px;
  background-color: hsl(var(--border-subtle));
  margin: 0.5rem -0.5rem;
}

/* Submenu */
.dropdownSubTrigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  cursor: pointer;
  outline: none;
  transition: all 0.15s ease;
}

.dropdownSubTrigger:hover {
  background-color: hsl(var(--hover-overlay));
  color: hsl(var(--primary));
}

.dropdownSubContent {
  /* Mesmo estilo do content principal */
  background-color: hsl(var(--surface-3)) !important;
  border: 1px solid hsl(var(--border-default));
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  padding: 0.5rem;
  animation: dropdownShow 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

/* Checkbox/Radio items */
.dropdownCheckboxItem,
.dropdownRadioItem {
  padding-left: 2rem;
  position: relative;
}

.dropdownItemIndicator {
  position: absolute;
  left: 0.75rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1rem;
  height: 1rem;
}

/* Atalho de teclado */
.dropdownShortcut {
  margin-left: auto;
  font-size: 0.75rem;
  color: hsl(var(--text-tertiary));
  padding-left: 1rem;
}

/* Variantes de item */
.dropdownItem[data-variant="danger"] {
  color: hsl(var(--danger));
}

.dropdownItem[data-variant="danger"]:hover {
  background-color: hsl(var(--danger) / 0.1);
  color: hsl(var(--danger));
}

.dropdownItem[data-variant="danger"] .dropdownItemIcon {
  color: hsl(var(--danger));
}
````

### 4. **Cards e superfícies reformuladas**

````css
/* Sistema de Cards com elevação e hierarquia visual */

.card {
  background-color: hsl(var(--surface-1));
  border: 1px solid hsl(var(--border-subtle));
  border-radius: var(--radius-xl);
  overflow: hidden;
  transition: all 0.2s ease;
}

/* Variantes de elevação */
.card[data-elevation="0"] {
  box-shadow: none;
}

.card[data-elevation="1"] {
  box-shadow: var(--shadow-sm);
}

.card[data-elevation="2"] {
  box-shadow: var(--shadow-md);
}

.card[data-elevation="3"] {
  box-shadow: var(--shadow-lg);
}

/* Card interativo */
.card[data-interactive="true"] {
  cursor: pointer;
}

.card[data-interactive="true"]:hover {
  border-color: hsl(var(--border-default));
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.card[data-interactive="true"]:active {
  transform: translateY(0);
}

/* Card header */
.cardHeader {
  padding: 1.5rem;
  border-bottom: 1px solid hsl(var(--border-subtle));
  background-color: hsl(var(--surface-0) / 0.5);
}

.cardHeader[data-compact="true"] {
  padding: 1rem 1.5rem;
}

.cardTitle {
  font-size: 1.125rem;
  font-weight: 600;
  line-height: 1.75rem;
  color: hsl(var(--text-primary));
  margin: 0;
}

.cardDescription {
  font-size: 0.875rem;
  line-height: 1.5rem;
  color: hsl(var(--text-secondary));
  margin: 0.25rem 0 0 0;
}

/* Card content */
.cardContent {
  padding: 1.5rem;
}

.cardContent[data-compact="true"] {
  padding: 1rem 1.5rem;
}

.cardContent[data-noPadding="true"] {
  padding: 0;
}

/* Card footer */
.cardFooter {
  padding: 1rem 1.5rem;
  border-top: 1px solid hsl(var(--border-subtle));
  background-color: hsl(var(--surface-0) / 0.5);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
}

.cardFooter[data-compact="true"] {
  padding: 0.75rem 1.5rem;
}

/* Card variantes */
.card[data-variant="outlined"] {
  background-color: transparent;
  border: 2px solid hsl(var(--border-default));
}

.card[data-variant="filled"] {
  background-color: hsl(var(--surface-2));
  border: none;
}

.card[data-variant="gradient"] {
  background: linear-gradient(135deg, hsl(var(--surface-1)), hsl(var(--surface-2)));
  border: 1px solid hsl(var(--border-subtle) / 0.5);
}

/* Estados do card */
.card[data-state="success"] {
  border-color: hsl(var(--success) / 0.3);
  background-color: hsl(var(--success) / 0.05);
}

.card[data-state="warning"] {
  border-color: hsl(var(--warning) / 0.3);
  background-color: hsl(var(--warning) / 0.05);
}

.card[data-state="danger"] {
  border-color: hsl(var(--danger) / 0.3);
  background-color: hsl(var(--danger) / 0.05);
}

.card[data-state="info"] {
  border-color: hsl(var(--info) / 0.3);
  background-color: hsl(var(--info) / 0.05);
}
````

### 5. **Modal com fundo SÓLIDO e sem transparência**

````css
/* Sistema de Modal - SEMPRE com fundo sólido */

/* Backdrop escuro */
.modalBackdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.75) !important;
  backdrop-filter: blur(8px);
  z-index: 100;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Container do modal */
.modalContainer {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 101;
  overflow-y: auto;
}

/* Content do modal - SEMPRE SÓLIDO */
.modalContent {
  /* Fundo completamente sólido */
  background-color: hsl(var(--surface-3)) !important;
  color: hsl(var(--text-primary));
  
  /* Bordas e sombras fortes */
  border: 1px solid hsl(var(--border-default));
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  
  /* Layout */
  width: 100%;
  max-width: 32rem;
  max-height: calc(100vh - 2rem);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  
  /* Animação */
  animation: modalSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Tamanhos do modal */
.modalContent[data-size="sm"] { max-width: 24rem; }
.modalContent[data-size="md"] { max-width: 32rem; }
.modalContent[data-size="lg"] { max-width: 48rem; }
.modalContent[data-size="xl"] { max-width: 64rem; }
.modalContent[data-size="full"] { 
  max-width: calc(100vw - 2rem);
  max-height: calc(100vh - 2rem);
}

/* Header do modal */
.modalHeader {
  padding: 1.5rem;
  border-bottom: 1px solid hsl(var(--border-subtle));
  background-color: hsl(var(--surface-2));
  flex-shrink: 0;
}

.modalTitle {
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.75rem;
  color: hsl(var(--text-primary));
  margin: 0;
}

.modalDescription {
  font-size: 0.875rem;
  line-height: 1.5rem;
  color: hsl(var(--text-secondary));
  margin: 0.5rem 0 0 0;
}

/* Body do modal */
.modalBody {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
  background-color: hsl(var(--surface-3));
}

/* Footer do modal */
.modalFooter {
  padding: 1rem 1.5rem;
  border-top: 1px solid hsl(var(--border-subtle));
  background-color: hsl(var(--surface-2));
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
  flex-shrink: 0;
}

/* Close button */
.modalClose {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  border: none;
  background-color: transparent;
  color: hsl(var(--text-secondary));
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 1;
}

.modalClose:hover {
  background-color: hsl(var(--hover-overlay));
  color: hsl(var(--text-primary));
}

.modalClose:focus-visible {
  outline: 2px solid hsl(var(--focus-ring));
  outline-offset: 2px;
}

/* Variantes do modal */
.modalContent[data-variant="danger"] .modalHeader {
  background-color: hsl(var(--danger) / 0.1);
  border-bottom-color: hsl(var(--danger) / 0.2);
}

.modalContent[data-variant="success"] .modalHeader {
  background-color: hsl(var(--success) / 0.1);
  border-bottom-color: hsl(var(--success) / 0.2);
}

/* Modal fullscreen em mobile */
@media (max-width: 640px) {
  .modalContainer {
    padding: 0;
  }
  
  .modalContent {
    max-width: 100%;
    max-height: 100%;
    height: 100%;
    border-radius: 0;
  }
}
````

### 6. **Theme Toggle melhorado**

````css
/* Theme Toggle - Visual aprimorado */

.themeToggleButton {
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-lg);
  border: 2px solid hsl(var(--border-default));
  background-color: hsl(var(--surface-1));
  color: hsl(var(--text-primary));
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.themeToggleButton:hover {
  background-color: hsl(var(--surface-2));
  border-color: hsl(var(--primary) / 0.5);
  transform: scale(1.05);
}

.themeToggleButton:active {
  transform: scale(0.95);
}

.themeToggleButton:focus-visible {
  outline: 2px solid hsl(var(--focus-ring));
  outline-offset: 2px;
}

/* Ícones */
.themeIcon {
  width: 1.25rem;
  height: 1.25rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: absolute;
}

/* Animações dos ícones */
.themeIcon[data-state="light"] {
  animation: rotateIn 0.3s ease;
}

.themeIcon[data-state="dark"] {
  animation: slideIn 0.3s ease;
}

@keyframes rotateIn {
  from {
    transform: rotate(-90deg) scale(0);
    opacity: 0;
  }
  to {
    transform: rotate(0) scale(1);
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    transform: translateY(-10px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Tooltip */
.themeTooltip {
  position: absolute;
  bottom: calc(100% + 0.5rem);
  left: 50%;
  transform: translateX(-50%);
  padding: 0.5rem 0.75rem;
  background-color: hsl(var(--foreground));
  color: hsl(var(--background));
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: var(--radius-md);
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
}

.themeToggleButton:hover .themeTooltip {
  opacity: 1;
}

/* Indicador de tema ativo */
.themeToggleButton::after {
  content: "";
  position: absolute;
  bottom: 0.25rem;
  left: 50%;
  transform: translateX(-50%);
  width: 0.25rem;
  height: 0.25rem;
  border-radius: 50%;
  background-color: hsl(var(--primary));
  opacity: 0;
  transition: opacity 0.2s ease;
}

.themeToggleButton[data-active="true"]::after {
  opacity: 1;
}
````

### 7. **Dashboard e páginas internas reformuladas**

````css
/* Dashboard - Layout moderno e limpo */

.dashboardContainer {
  min-height: 100vh;
  background-color: hsl(var(--background));
}

/* Header aprimorado */
.dashboardHeader {
  background-color: hsl(var(--surface-1));
  border-bottom: 1px solid hsl(var(--border-subtle));
  padding: 1.5rem 2rem;
  position: sticky;
  top: 0;
  z-index: 40;
  backdrop-filter: blur(10px);
  background-color: hsl(var(--surface-1) / 0.95);
}

.headerContent {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
}

.headerTitle {
  font-size: 1.5rem;
  font-weight: 700;
  color: hsl(var(--text-primary));
  margin: 0;
}

.headerSubtitle {
  font-size: 0.875rem;
  color: hsl(var(--text-secondary));
  margin: 0.25rem 0 0 0;
}

/* Main content */
.dashboardMain {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

/* Grid de métricas */
.metricsGrid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  margin-bottom: 2rem;
}

.metricCard {
  background-color: hsl(var(--surface-1));
  border: 1px solid hsl(var(--border-subtle));
  border-radius: var(--radius-xl);
  padding: 1.5rem;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.metricCard:hover {
  border-color: hsl(var(--border-default));
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.metricCard::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, hsl(var(--primary)), hsl(var(--secondary)));
  opacity: 0;
  transition: opacity 0.2s ease;
}

.metricCard:hover::before {
  opacity: 1;
}

.metricHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.metricIcon {
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-lg);
  background-color: hsl(var(--primary) / 0.1);
  color: hsl(var(--primary));
}

.metricValue {
  font-size: 2rem;
  font-weight: 700;
  color: hsl(var(--text-primary));
  line-height: 1;
  margin-bottom: 0.5rem;
}

.metricLabel {
  font-size: 0.875rem;
  color: hsl(var(--text-secondary));
}

.metricChange {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-full);
  margin-top: 0.5rem;
}

.metricChange[data-positive="true"] {
  background-color: hsl(var(--success) / 0.1);
  color: hsl(var(--success));
}

.metricChange[data-positive="false"] {
  background-color: hsl(var(--danger) / 0.1);
  color: hsl(var(--danger));
}

/* Seções de conteúdo */
.contentSection {
  margin-bottom: 2rem;
}

.sectionHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.sectionTitle {
  font-size: 1.25rem;
  font-weight: 600;
  color: hsl(var(--text-primary));
}

/* Empty states */
.emptyState {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  background-color: hsl(var(--surface-1));
  border: 2px dashed hsl(var(--border-default));
  border-radius: var(--radius-xl);
}

.emptyIcon {
  width: 4rem;
  height: 4rem;
  color: hsl(var(--text-tertiary));
  margin-bottom: 1rem;
}

.emptyTitle {
  font-size: 1.125rem;
  font-weight: 600;
  color: hsl(var(--text-primary));
  margin-bottom: 0.5rem;
}

.emptyDescription {
  font-size: 0.875rem;
  color: hsl(var(--text-secondary));
  max-width: 24rem;
  margin-bottom: 1.5rem;
}
````

## 🎯 Resumo das Melhorias

### ✅ Problemas Corrigidos:
1. **Modais e Dropdowns**: Agora têm fundos SEMPRE sólidos (sem transparência)
2. **Hierarquia Visual**: Sistema de superfícies com 4 níveis de elevação
3. **Contraste**: Cores otimizadas para melhor legibilidade em ambos os temas
4. **Feedback Visual**: Botões com estados hover/active claros e animações suaves
5. **Consistência**: Sistema de design unificado com variáveis bem organizadas

### 🎨 Novos Recursos:
1. **Sistema de Elevação**: 5 níveis de sombra para criar profundidade
2. **Paleta Expandida**: Cores semânticas (success, warning, danger, info)
3. **Animações Refinadas**: Transições suaves e naturais
4. **Estados Interativos**: Hover, active, focus bem definidos
5. **Tipografia Hierárquica**: 4 níveis de texto (primary, secondary, tertiary, disabled)

### 🚀 Benefícios:
- Interface mais profissional e moderna
- Melhor acessibilidade e usabilidade
- Temas claro/escuro perfeitamente balanceados
- Fácil manutenção com variáveis CSS organizadas
- Performance otimizada com transições GPU-accelerated

Essas mudanças criarão uma experiência muito mais agradável e profissional para seus usuários!

Similar code found with 2 license types