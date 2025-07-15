export const FUNNEL_TEMPLATES = {
  b2c: {
    name: 'Funil B2C - Padrão',
    description: 'Funil otimizado para vendas diretas ao consumidor',
    isDefault: false,
    stages: [
      { name: 'Novo Lead', description: 'Cliente recém-captado', color: 'blue' as const },
      { name: 'Primeiro Contato', description: 'Primeiro contato realizado', color: 'purple' as const },
      { name: 'Proposta Enviada', description: 'Proposta comercial enviada', color: 'yellow' as const },
      { name: 'Negociação', description: 'Em processo de negociação', color: 'orange' as const },
      { name: 'Fechamento', description: 'Cliente fechou o negócio', color: 'green' as const },
      { name: 'Perdido', description: 'Cliente não converteu', color: 'red' as const },
    ],
  },
  b2b: {
    name: 'Funil B2B - Empresarial',
    description: 'Funil estruturado para vendas corporativas',
    isDefault: false,
    stages: [
      { name: 'Qualificação', description: 'Qualificação do lead empresarial', color: 'blue' as const },
      { name: 'Descoberta', description: 'Identificação de necessidades', color: 'purple' as const },
      { name: 'Apresentação', description: 'Apresentação da solução', color: 'yellow' as const },
      { name: 'Proposta Comercial', description: 'Proposta formal enviada', color: 'orange' as const },
      { name: 'Negociação', description: 'Ajustes e negociação final', color: 'orange' as const },
      { name: 'Contrato', description: 'Assinatura de contrato', color: 'green' as const },
      { name: 'Perdido', description: 'Oportunidade perdida', color: 'red' as const },
    ],
  },
  support: {
    name: 'Funil de Suporte',
    description: 'Gestão de tickets e atendimento ao cliente',
    isDefault: false,
    stages: [
      { name: 'Ticket Aberto', description: 'Solicitação recebida', color: 'blue' as const },
      { name: 'Em Análise', description: 'Analisando a solicitação', color: 'yellow' as const },
      { name: 'Em Andamento', description: 'Trabalhando na solução', color: 'orange' as const },
      { name: 'Aguardando Cliente', description: 'Aguardando retorno do cliente', color: 'purple' as const },
      { name: 'Resolvido', description: 'Problema solucionado', color: 'green' as const },
      { name: 'Fechado', description: 'Ticket encerrado', color: 'gray' as const },
    ],
  },
};
