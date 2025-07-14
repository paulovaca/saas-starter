Documento de Requisitos de Produto (PRD): CRM SaaS para Agências de Viagens
Versão: 3.0
Data: 12 de julho de 2025
Projeto: Plataforma SaaS de CRM e Gestão para Agências de Viagens
1. Resumo Executivo e Introdução
Este documento descreve os requisitos para uma plataforma CRM (Customer Relationship Management) oferecida no modelo SaaS (Software as a Service), customizada para agências de viagens. A plataforma foi projetada para centralizar e otimizar todo o ciclo de vida do cliente, desde a captação e qualificação através de funis de venda, passando pela criação de propostas complexas com múltiplos produtos e operadoras, até a gestão de reservas ativas e o controle financeiro completo da agência.
O sistema visa fornecer uma solução robusta para que agências gerenciem seus portfólios de operadoras, comissionamentos variados, processos de vendas e saúde financeira, utilizando uma stack de tecnologia moderna (Node.js, Next.js, PostgreSQL). Cada agência que assina o serviço é um "tenant" (inquilino) independente na plataforma.
2. Perfis de Usuário e Permissões
O sistema operará com múltiplos níveis de acesso, separando o suporte da plataforma (Desenvolvedor) dos usuários da agência cliente (Master, Administrador, Agente).
Perfil
Descrição e Permissões
Desenvolvedor (Super Admin)
Acesso Global à Plataforma. Gerencia os tenants (as agências clientes).
Gerencia as contas das agências (ativação, suspensão).Pode acessar e alterar o perfil do usuário Master de qualquer agência.Acesso ao backend e banco de dados global para manutenção e suporte. Existe a opção de deixar o acesso ao BD exclusivo a agencia que contrata, nesse caso o desenvolverdor nao tema cesso.
Master (Dono da Agência)
Acesso Total dentro da Agência (Tenant). O usuário que contrata o SaaS inicia como Master.
Gerencia todos os usuários da sua agência (Administradores e Agentes - cria, edita, exclui).Define e gerencia Funis de Venda, Operadoras e Itens Base.Gerencia o financeiro global da agência.Pode transferir clientes entre agentes (com justificativa).Acesso completo aos logs de auditoria da agência.
Administrador
Acesso de Gestão Operacional. Gerencia a operação diária e a equipe de agentes.
Gerencia usuários Agentes (cria, edita, exclui, define comissões).Não pode gerenciar o usuário Master ou outros Administradores.Define e gerencia Funis de Venda, Operadoras e Itens Base.Gerencia o financeiro global da agência.Pode transferir clientes entre agentes (com justificativa).Acesso completo aos logs de auditoria da agência.
Agente
Acesso Operacional de Vendas. Focado em sua carteira de clientes.
Visualiza e gerencia apenas os seus próprios clientes, propostas e reservas.Visualiza relatórios financeiros relativos às suas próprias vendas e comissões.Visualiza apenas os logs de auditoria relacionados às suas ações.Não possui acesso a configurações sistêmicas ou gestão financeira global.

3. Requisitos Funcionais
3.1. Módulo de Gestão de Clientes
RF01: Qualquer usuário pode cadastrar um novo cliente manualmente.
RF02: Campos de cadastro: Nome, Sobrenome, Telefone, Email, Endereço, Cidade, Estado, País, Fonte do Cliente, Tags e Observações.
RF03: Ao ser cadastrado, um cliente é atrelado ao usuário que o criou e inserido automaticamente no funil de vendas padrão com status "Ativo".
RF04: A tela principal de clientes deve ser uma tabela com: Cliente, Status, Funil Atual, Etapa Atual, Agente Responsável, Valor em Aberto, Valor Total Gasto, Data da Última Interação e Ações.
RF05: Na coluna "Ações":
Registrar Interação: Registrar contato (ligação, e-mail, etc).
Agendar Tarefas.
Editar: Alterar dados cadastrais, status ou etapa do funil.
Visualizar: Perfil completo do cliente, inclusive interações.
Transferir Agente (Master/Admin): Mudar o agente responsável. Deve exigir um campo de justificativa obrigatório (Ver RF36).
Excluir Cliente (Master/Admin).
3.2. Módulo de Gestão de Funis de Venda
RF06 (Master/Admin): Gerenciar múltiplos funis de venda.
RF07 (Master/Admin): Definir etapas de cada funil (Ex: "Novo Lead", "Proposta Enviada").
RF08 (Master/Admin): Cada etapa deve ter "Nome" e "Instruções" (guia para o agente).
RF09 (Master/Admin): Definir um funil como o "padrão" para novos clientes.
3.3. Módulo de Itens Base (Catálogo de Serviços)
RF10 (Master/Admin): Deve haver uma página exclusiva para cadastrar, editar e excluir "Itens Base" (produtos genéricos, como "Passagem Aérea", "Hospedagem", "Ingresso de Parque").
RF11 (Master/Admin): Ao cadastrar/editar um Item Base, o usuário deve poder adicionar campos personalizados necessários para aquele item.
RF12 (Master/Admin): Para cada campo personalizado, teremos campos padrão, por exemplo: Check-in - campo de data, numero de adultos, campo de numero positivo, valor - campo de R$, etc. Então para acrescentarmos um Item Base colocamos nome “data de check-in”, definimos que é um campo de data e definimos obrigatoriedade.
Exemplo 1: Item "Hospedagem" teria campos como Nome do Hotel (texto), Data de Check-in (obrigatório), Data de Check-out (obrigatório), Tipo de Pensão(texto), Nº de Adultos(numero), etc.
Exemplo 2: Item "Ingresso" teria campos como Nome do Parque, Data de Uso (obrigatório), Tipo de Ingresso (inteira/meia).
3.4. Módulo de Gestão de Operadoras e Portfólio
RF13 (Master/Admin): Deve haver uma página exclusiva para cadastrar, editar e excluir Operadoras (fornecedores).
RF14 (Master/Admin): Na página de edição da Operadora, montar seu portfólio associando Itens Base cadastrados.
RF15 (Master/Admin): Para montar o portfólio, o usuário seleciona um "Item Base" já cadastrado no sistema e o associa àquela operadora. O sistema deve permitir cadastrar diferentes "Formas de Pagamento" (Ex: PIX, Cartão 1x, Cartão 12x, Boleto). Um item base pode ser associado a varias operadoras.
RF16 (Revisado): Ao associar um Item Base a uma Operadora, o usuário deve definir as regras de comissionamento para cada Forma de Pagamento disponível.
Exemplo: Item "Hospedagem" na "Operadora X": PIX = 15% de comissão; Cartão 1x = 10%; Boleto = 12%.
3.5. Módulo de Criação e Gestão de Propostas
RF17: Criação de proposta selecionando um cliente (com permissões de visibilidade respeitadas).
RF18: A proposta deve ter um campo "Data de Validade".
RF19: Fluxo de adição de produto na proposta:
O usuário seleciona uma Operadora.
O sistema exibe a lista de Itens Base que foram associados àquela Operadora.
O usuário seleciona um Item Base.
O sistema exibe os campos personalizados daquele Item Base para preenchimento.
Após preencher os campos obrigatórios, o botão "Acrescentar Produto" é habilitado.
RF20: Uma proposta pode conter múltiplos produtos. O sistema calcula o valor total.
RF21: Botão "Exportar Proposta" com duas opções:
Gerar PDF: Exportar um arquivo PDF baseado em um template personalizado.
Copiar para WhatsApp: Gerar um texto formatado e copiá-lo para a área de transferência, pronto para colar em aplicativos de mensagem.
RF22: Ao confirmar o pagamento de uma proposta (marcar como "Vendida/Paga"), o sistema deve automaticamente convertê-la em uma "Reserva Ativa" e movê-la para o módulo de reservas.
3.6. Módulo de Gestão de Reservas
RF23: Uma página dedicada para gerenciar todas as "Reservas Ativas" (propostas que foram pagas/confirmadas). (com permissões de visibilidade respeitadas).
RF24: A lista de reservas deve exibir informações cruciais para o pós-venda: Cliente, Agente, Data da Viagem/Check-in, Valor Total, Status da Reserva (Ex: Aguardando Emissão, Vouchers Emitidos, Viagem em Andamento, Concluída).
RF25: Dentro de uma reserva, deve ser possível anexar documentos relevantes (vouchers, passagens, contratos).
3.7. Módulo de Gestão de Agentes e Usuários
RF26 (Master/Admin): Gerenciar agentes (cadastrar, editar, desativar, definir comissões, resetar senha).
RF27 (Revisado): O usuário Master pode criar, editar e gerenciar usuários Administradores e Agentes, incluindo a alteração do perfil entre os dois tipos.
3.8. Módulo de Gestão Financeira
RF28: Visibilidade baseada em perfil (Agentes veem suas comissões; Master/Admin veem o financeiro global).
RF29 (Master/Admin): Funcionalidade de "Contas a Receber" (automaticamente alimentada pelas Reservas Ativas) e "Contas a Pagar" (despesas operacionais da agência).
RF30 (Master/Admin): Permitir o lançamento manual de transações financeiras (receitas ou despesas) não vinculadas a propostas, com categorização (Ex: Salários, Aluguel, Marketing).
RF31 (Master/Admin): Capacidade de editar ou excluir operações financeiras lançadas manualmente ou geradas automaticamente (gerando log de auditoria).
RF32 (Master/Admin): Relatório de Fluxo de Caixa e DRE (Demonstrativo de Resultado do Exercício) simplificado.
3.9. Módulo de Log de Auditoria
RF33: Registro automático de todas as ações críticas.
RF34: O log registra: ação, usuário, data/hora e registro afetado.
RF35: Visibilidade de logs baseada em permissões. Deve haver uma página específica para visualizar os logs.
Agentes veem apenas logs de suas ações ou de ações que afetaram seus registros.
Master/Admin veem todos os logs do sistema.
RF36: Logs de transferência de cliente devem incluir o conteúdo do campo "Justificativa".
3.10. Módulo de Notificações e E-mails
RF37: Centro de notificações "in-app" (sino) e capacidade de envio de e-mails transacionais.
RF38: Gatilhos para notificações (In-app e E-mail):
Novo Cliente Atribuído.
Proposta Próxima da Validade.
Proposta Convertida em Reserva.
Tarefas agendadas nos clientes.
RF39: Painel de configuração para ativar/desativar tipos específicos de notificações por e-mail.
4. Requisitos Não-Funcionais
RNF01 - Tecnologia (Revisado):
Backend: Node.js.
Frontend: Next.js (React).
Banco de Dados: PostgreSQL.
Arquitetura: Multi-tenant para suportar o modelo SaaS.
RNF02 - Usabilidade: Interface intuitiva, limpa e responsiva.
RNF03 - Desempenho: Carregamento rápido de páginas e execução de ações comuns em menos de 3 segundos.
RNF04 - Segurança: Proteção robusta contra vulnerabilidades web, isolamento de dados entre tenants (agências) e armazenamento seguro de senhas.
RNF05 - Filtragem Avançada: Todas as páginas de listagem devem conter opções de filtro robustas e específicas.
RNF06 - Tema claro e escuro: A aplicação deve ter a opção de tema claro e escuro, mudança através de um ícone pequeno.
RNF07 - Área de perfil de Usuário: Área de perfil de usuário para que possibilite ao usuário adicionar foto, e mudar os seus dados, inclusive redefinir sua senha, autenticação de dois fatores, etc
5. Fora do Escopo (Próximas Versões)
Integração com APIs de conversação (WhatsApp, Messenger, etc.).
Portal do Cliente.
Integração Direta com Operadoras/GDS.
6. Métricas de Sucesso
MRR (Monthly Recurring Revenue): Receita mensal recorrente das assinaturas SaaS.
Churn Rate: Taxa de cancelamento de assinaturas.
Adoção e Engajamento: Frequência de login diário e volume de propostas/reservas geradas.
Eficiência Operacional: Redução no tempo médio para criação de propostas e emissão de reservas.

