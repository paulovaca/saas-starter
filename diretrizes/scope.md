🧩 Scope
O escopo deste projeto é o desenvolvimento completo de uma plataforma SaaS (Software as a Service) multi-inquilino (multi-tenant) de CRM e Gestão, projetada especificamente para as necessidades de agências de viagens. A plataforma centralizará o ciclo de vida do cliente, desde a captura e gestão em funis de venda, passando pela criação de propostas comerciais complexas com múltiplos produtos e operadoras, até a gestão de reservas ativas e o controle financeiro.
A arquitetura será baseada no schema Prisma fornecido, utilizando uma stack de tecnologia com Node.js no backend, Next.js no frontend e PostgreSQL como banco de dados, garantindo isolamento de dados entre as agências clientes (tenants).
✅ Functional Requirements
A plataforma implementará todos os requisitos funcionais detalhados no PRD Versão 3.0, incluindo:
RF01-RF05: Módulo de Gestão de Clientes (cadastro, listagem, perfil completo, interações, tarefas, transferência e exclusão).
RF06-RF09: Módulo de Gestão de Funis de Venda (criação de múltiplos funis e etapas personalizadas).
RF10-RF12: Módulo de Itens Base (catálogo de produtos genéricos com campos customizáveis).
RF13-RF16: Módulo de Gestão de Operadoras e Portfólio (cadastro de fornecedores, associação de itens e definição de comissionamentos por forma de pagamento).
RF17-RF22: Módulo de Criação e Gestão de Propostas (composição de propostas, cálculo de totais, exportação para PDF/WhatsApp e conversão em reserva).
RF23-RF25: Módulo de Gestão de Reservas (pós-venda, controle de status e anexação de documentos).
RF26-RF27: Módulo de Gestão de Agentes e Usuários (administração de contas e permissões dentro da agência).
RF28-RF32: Módulo de Gestão Financeira (contas a pagar/receber, lançamentos manuais, relatórios de fluxo de caixa e DRE).
RF33-RF36: Módulo de Log de Auditoria (registro e visualização de ações críticas com base em permissões).
RF37-RF39: Módulo de Notificações e E-mails (centro de notificações in-app e e-mails transacionais).
⚙️ Non-Functional Requirements
Performance (RNF03):
O tempo de carregamento inicial (LCP - Largest Contentful Paint) para páginas críticas como Dashboard e Lista de Clientes deve ser inferior a 2.5 segundos.
As respostas da API para ações comuns (ex: salvar um cliente, adicionar item à proposta) devem ser concluídas em menos de 500ms.
A execução de ações no frontend (ex: abrir um modal, filtrar uma tabela) deve ocorrer em menos de 3 segundos, conforme especificado no PRD.
Security (RNF04):
Isolamento de Dados (Multi-Tenancy): Implementação estrita de isolamento de dados a nível de API e banco de dados. Todas as queries ao banco de dados deverão, obrigatoriamente, conter uma cláusula WHERE "agencyId" = ?. O uso de Row-Level Security (RLS) no PostgreSQL será avaliado e implementado para uma camada de segurança adicional.
Autenticação e Autorização: Uso de JSON Web Tokens (JWT) para gerenciamento de sessões. As permissões baseadas em UserRole (Master, Admin, Agent) serão validadas em cada endpoint da API para garantir que os usuários só possam executar as ações permitidas para seu perfil.
Proteção de Dados: Senhas serão armazenadas utilizando o algoritmo bcrypt. Dados sensíveis dos clientes serão protegidos contra vulnerabilidades comuns da OWASP Top 10, como XSS (Cross-Site Scripting) e Insecure Direct Object References (IDOR).
Scalability (RNF01):
A arquitetura multi-tenant será projetada para escalar horizontalmente. O uso de uma stack serverless-friendly (Next.js/Vercel) permitirá o dimensionamento automático da aplicação conforme a demanda.
O banco de dados PostgreSQL será configurado com um pool de conexões (ex: PgBouncer) para gerenciar eficientemente as conexões concorrentes de múltiplos tenants.
📚 Guidelines & Packages
Guidelines:
Seguir a estrutura de projeto do Next.js SaaS Starter.
Utilizar Conventional Commits para o versionamento do código.
Manter o código formatado com ESLint e Prettier seguindo as regras do projeto.
Todo novo componente ou função de backend deve ser acompanhado de testes unitários ou de integração.

Packages & Licenses:
Framework: next (MIT), react (MIT)
UI/Styling: tailwindcss (MIT), shadcn/ui (MIT), lucide-react (ISC)
ORM & DB: prisma (Apache-2.0), pg (MIT)
Autenticação: next-auth (ISC)
Gestão de Estado/Queries: tanstack/react-query (MIT)
Formulários: react-hook-form (MIT), zod (MIT) para validação.
Tabelas e Listas: tanstack/react-table (MIT)
PDF Generation: @react-pdf/renderer (MIT)
Gráficos e Relatórios: recharts (MIT)
Notificações (Toast): react-hot-toast (MIT)
Nota: Todas as licenças são permissivas e adequadas para uso comercial.
🔐 Threat Model (Stub)
Acesso de Dados Entre Tenants (Cross-Tenant Access): Ameaça mais crítica. Um usuário mal-intencionado (ou um bug) da Agência A poderia acessar, modificar ou excluir dados da Agência B. Mitigação: Isolamento de dados rigoroso em todas as camadas da aplicação (API, RLS no DB).
Escalação de Privilégio: Um usuário Agente conseguindo executar ações de Admin ou Master através da manipulação de requisições à API. Mitigação: Validação de permissões robusta no backend para cada requisição.
Injeção de Scripts (XSS): Inserção de scripts maliciosos em campos de texto como "Observações do Cliente", "Instruções da Etapa do Funil" ou "Descrição do Item". Mitigação: Sanitização de toda e qualquer entrada de dados do usuário antes da renderização no HTML.
Vazamento de Informações Pessoais Identificáveis (PII): Exposição de dados de clientes (nome, e-mail, telefone) através de APIs inseguras ou logs. Mitigação: Controle de acesso, não expor dados desnecessários em respostas de API e auditar logs.
🔢 Execution Plan
O plano será executado em fases modulares, construindo a base da aplicação primeiro e adicionando funcionalidades de forma incremental.

Consultar os arquivos diretrizes\prd-saas.md, diretrizes\schema-prisma.md e diretrizes\flowchar-mermaid.md para ter precisão na execução do plano
Fase 1: Fundação, Autenticação e Multi-Tenancy 
Configuração do Projeto: Inicializar o projeto com o nextjs/saas-starter.
Integração do Banco de Dados: Configurar a conexão com o PostgreSQL e rodar a primeira migration do schema Prisma para criar as tabelas Agency, User e AgencySettings.
Mecanismo de Onboarding/Tenant: Criar o fluxo de registro onde uma nova Agency é criada junto com seu primeiro usuário Master.
Autenticação e Permissões:
Configurar NextAuth.js para login com e-mail e senha.
Implementar a lógica de session para incluir userId, agencyId e role.
Criar um middleware no Next.js (ou HOCs/hooks) para proteger rotas e validar permissões (Master, Admin, Agent) em chamadas de API.
Implementação do Isolamento de Dados: Garantir que todas as chamadas do Prisma Service no backend incluam where: { agencyId: session.agencyId }.
RNF07 - Perfil de Usuário: Criar a página de perfil onde o usuário logado pode alterar seu nome, avatar, senha e configurar 2FA.

Consultar os arquivos diretrizes\prd-saas.md, diretrizes\schema-prisma.md e diretrizes\flowchar-mermaid.md para ter precisão na execução do plano
Fase 2: Módulos de Configuração da Agência (Duração Estimada: 2 semanas)
Etapa 1: Gestão de Usuários (RF26, RF27)
Criar a UI para Master e Admin gerenciarem outros usuários.
Desenvolver endpoints da API para criar, editar (inclusive perfil), desativar e resetar senha de Admin e Agent, respeitando as regras de permissão.
Etapa 2: Módulo de Gestão de Funis de Venda (RF06-RF09)
Desenvolver a UI para Master/Admin criarem e gerenciarem funis e suas etapas (SalesFunnel, SalesFunnelStage).
Implementar a lógica para definir um funil como padrão.
Etapa 3: Módulo de Itens Base (Catálogo) (RF10-RF12)
Criar a UI para Master/Admin gerenciar BaseItem.
Implementar a lógica para adicionar campos personalizados dinâmicos (BaseItemField) com tipos definidos (data, número, texto, etc.) e regra de obrigatoriedade.
Etapa 4: Módulo de Gestão de Operadoras (RF13-RF16)
Criar a UI para Master/Admin gerenciar Operator.
Na edição de uma operadora, desenvolver a interface para associar BaseItem (criando um OperatorItem) e definir as comissões por forma de pagamento (OperatorItemPaymentMethod).

Consultar os arquivos diretrizes\prd-saas.md, diretrizes\schema-prisma.md e diretrizes\flowchar-mermaid.md para ter precisão na execução do plano
Fase 3: Core do CRM - Clientes e Propostas (Duração Estimada: 3 semanas)
Etapa 5: Módulo de Gestão de Clientes (RF01-RF05, RF36)
Criar o formulário de cadastro de Client (RF01, RF02).
Implementar a lógica de backend que, ao criar, atrela o cliente ao criador e ao funil padrão (RF03).
Construir a tabela de clientes (tanstack/react-table) com os campos do RF04 e filtros avançados (RNF05).
Implementar os modais/páginas para as ações:
Registrar Interaction.
Agendar Task.
Editar Client.
Visualizar perfil completo do cliente.
Master/Admin: Transferir agente (com justificativa obrigatória, criando um ClientTransfer) e Excluir cliente.
Etapa 6: Módulo de Criação e Gestão de Propostas (RF17-RF21)
Desenvolver a UI para listagem de Proposal.
Criar o fluxo de "Nova Proposta": selecionar cliente, definir validade (RF17, RF18).
Implementar o fluxo de adição de produtos (RF19): selecionar operadora -> listar itens da operadora -> selecionar item -> preencher campos customizados -> adicionar à proposta.
A proposta deve calcular o valor total dinamicamente (RF20).
Implementar as funcionalidades de exportação (RF21):
Gerar PDF com @react-pdf/renderer.
Gerar texto formatado e copiar para a área de transferência.

Consultar os arquivos diretrizes\prd-saas.md, diretrizes\schema-prisma.md e diretrizes\flowchar-mermaid.md para ter precisão na execução do plano
Fase 4: Pós-Venda e Financeiro (Duração Estimada: 2.5 semanas)
Etapa 7: Módulo de Gestão de Reservas (RF22-RF25)
Implementar a lógica no backend para, ao marcar uma Proposal como "Paga", criar automaticamente uma Reservation (RF22).
Desenvolver a página de "Reservas Ativas" com listagem, filtros e informações cruciais (RF23, RF24).
Criar a visão de detalhe da reserva, permitindo alteração de status e anexação de Document (RF25).
Etapa 8: Módulo de Gestão Financeira (RF28-RF32)
Implementar a lógica para que cada Reservation criada gere automaticamente um FinancialRecord do tipo 'income' (Contas a Receber).
Construir as telas de "Contas a Receber" e "Contas a Pagar" para Master/Admin (RF29).
Desenvolver a funcionalidade para lançamento manual de transações (receitas e despesas) (RF30) e sua edição/exclusão (RF31).
Para Agentes, criar uma visão simplificada mostrando apenas as comissões de suas vendas (RF28).
Desenvolver os relatórios de Fluxo de Caixa e DRE simplificado utilizando recharts (RF32).

Consultar os arquivos diretrizes\prd-saas.md, diretrizes\schema-prisma.md e diretrizes\flowchar-mermaid.md para ter precisão na execução do plano
Fase 5: Módulos de Suporte e Finalização (Duração Estimada: 2 semanas)
Etapa 9: Módulo de Log de Auditoria (RF33-RF36)
Criar um serviço de logging no backend que possa ser chamado em pontos críticos (criação, edição, exclusão de entidades importantes, transferência de clientes).
O serviço irá gravar na tabela Log as informações necessárias.
Desenvolver a UI para visualização dos logs, aplicando os filtros de permissão (RF35).
Etapa 10: Módulo de Notificações (RF37-RF39)
Criar o modelo Notification no schema.
Implementar os gatilhos no backend para criar notificações in-app e enviar e-mails transacionais (usando um serviço como Resend ou SendGrid).
Desenvolver o componente de "sino" no frontend para exibir notificações não lidas.
Criar a página de configurações de notificação (RF39).
Etapa 11: Requisitos Não-Funcionais Finais
Implementar o seletor de tema claro/escuro (RNF06).
Realizar uma rodada de testes de performance e otimizações de query.
Conduzir uma revisão de segurança e aplicar correções.

Consultar os arquivos diretrizes\prd-saas.md, diretrizes\schema-prisma.md e diretrizes\flowchar-mermaid.md para ter precisão na execução do plano
Fase 6: Testes e Implantação (Contínuo)
Plano de Teste:
Testes Unitários (Jest/Vitest): Para funções de utilidade, lógicas de cálculo e serviços de backend isolados.
Testes de Integração: Para endpoints da API, verificando a interação com o banco de dados e a lógica de permissões.
Testes End-to-End (Cypress/Playwright): Para os fluxos de usuário mais críticos, como:
Registro de agência e login do Master.
Criação de um Agente pelo Master.
Login do Agente e cadastro de um Cliente.
Master configura um Funil, Item Base e Operadora.
Agente cria uma Proposta completa para seu cliente.
Master aprova o pagamento, que gera uma Reserva e um lançamento financeiro.
Verificação dos logs e notificações gerados.
Implantação: Configurar um pipeline de CI/CD (GitHub Actions) para automatizar testes e deploys para um ambiente de staging e, posteriormente, produção (ex: Vercel).

