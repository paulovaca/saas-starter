import { AppError, DatabaseError, ValidationError } from './index';

/**
 * Mapeia códigos de erro do PostgreSQL para mensagens amigáveis
 * 
 * @see https://www.postgresql.org/docs/current/errcodes-appendix.html
 */
export const postgresErrorMap: Record<string, string> = {
  // Class 08 — Connection Exception
  '08000': 'Erro de conexão com o banco de dados.',
  '08003': 'Conexão inexistente.',
  '08006': 'Falha na conexão com o banco de dados.',
  '08001': 'Cliente não conseguiu estabelecer conexão.',
  '08004': 'Servidor rejeitou a conexão.',
  '08007': 'Transação não reconhecida.',
  '08P01': 'Protocolo de comunicação violado.',

  // Class 22 — Data Exception
  '22000': 'Erro nos dados fornecidos.',
  '22001': 'Um ou mais campos excedem o tamanho máximo permitido.',
  '22002': 'Indicador nulo não permitido.',
  '22003': 'Valor numérico fora do intervalo permitido.',
  '22004': 'Atribuição nula não permitida.',
  '22005': 'Erro na atribuição de caracter.',
  '22008': 'Formato de data/hora inválido.',
  '22012': 'Operação matemática inválida (divisão por zero).',
  '22P02': 'Formato de dados inválido.',
  '22P03': 'Sequência de escape inválida.',
  '22P04': 'Valor inválido para formatação.',

  // Class 23 — Integrity Constraint Violation
  '23000': 'Violação de restrição de integridade.',
  '23001': 'Violação de restrição.',
  '23502': 'Campos obrigatórios não foram preenchidos.',
  '23503': 'Este registro está sendo usado em outro lugar e não pode ser removido.',
  '23505': 'Este registro já existe no sistema.',
  '23514': 'Violação de restrição de verificação.',
  '23P01': 'Violação de restrição de exclusão.',

  // Class 25 — Invalid Transaction State
  '25000': 'Estado de transação inválido.',
  '25001': 'Transação ativa.',
  '25002': 'Ramificação de transação inválida.',
  '25008': 'Transação em estado inconsistente.',
  '25P01': 'Nenhuma transação ativa.',
  '25P02': 'Transação em estado de falha.',

  // Class 28 — Invalid Authorization Specification
  '28000': 'Especificação de autorização inválida.',
  '28P01': 'Senha inválida.',

  // Class 2B — Dependent Privilege Descriptors Still Exist
  '2BP01': 'Privilégios dependentes ainda existem.',

  // Class 2D — Invalid Transaction Termination
  '2D000': 'Término de transação inválido.',

  // Class 2F — SQL Routine Exception
  '2F000': 'Exceção na rotina SQL.',
  '2F005': 'Função executada com parâmetros incorretos.',
  '2F002': 'Modificação de dados não permitida.',

  // Class 34 — Invalid Cursor Name
  '34000': 'Nome de cursor inválido.',

  // Class 38 — External Routine Exception
  '38000': 'Exceção na rotina externa.',
  '38001': 'Saída não permitida.',
  '38002': 'Modificação não permitida.',
  '38003': 'Declaração SQL proibida.',
  '38004': 'Dados nulos não permitidos.',

  // Class 39 — External Routine Invocation Exception
  '39000': 'Exceção na invocação de rotina externa.',
  '39001': 'Valor de retorno inválido.',
  '39004': 'Valor nulo não permitido.',
  '39P01': 'Parâmetro de gatilho não permitido.',
  '39P02': 'Valor de retorno SRF não permitido.',

  // Class 3B — Savepoint Exception
  '3B000': 'Exceção de ponto de salvamento.',
  '3B001': 'Especificação de ponto de salvamento inválida.',

  // Class 3D — Invalid Catalog Name
  '3D000': 'Nome de catálogo inválido.',

  // Class 3F — Invalid Schema Name
  '3F000': 'Nome de esquema inválido.',

  // Class 40 — Transaction Rollback
  '40000': 'Transação foi cancelada.',
  '40001': 'Falha de serialização.',
  '40002': 'Violação de restrição de integridade.',
  '40003': 'Conclusão de declaração desconhecida.',
  '40P01': 'Deadlock detectado.',

  // Class 42 — Syntax Error or Access Rule Violation
  '42000': 'Erro de sintaxe ou violação de regra de acesso.',
  '42601': 'Erro de sintaxe.',
  '42501': 'Privilégios insuficientes.',
  '42846': 'Não é possível converter.',
  '42803': 'Erro de agrupamento.',
  '42P20': 'Erro de janela.',
  '42P19': 'Definição inválida de função.',
  '42830': 'Sequência estrangeira inválida.',
  '42602': 'Nome inválido.',
  '42622': 'Nome muito longo.',
  '42939': 'Nome reservado.',
  '42804': 'Tipos de dados incompatíveis.',
  '42P18': 'Tipo de dados indeterminado.',
  '42P21': 'Problema de collation.',
  '42P22': 'Tipo de dados indeterminado.',
  '42809': 'Tipo de objeto incorreto.',
  '42703': 'Coluna indefinida.',
  '42883': 'Função indefinida.',
  '42P01': 'Tabela indefinida.',
  '42P02': 'Parâmetro indefinido.',
  '42704': 'Objeto indefinido.',
  '42701': 'Coluna duplicada.',
  '42P03': 'Cursor duplicado.',
  '42P04': 'Banco de dados duplicado.',
  '42723': 'Função duplicada.',
  '42P05': 'Esquema duplicado.',
  '42P06': 'Tabela duplicada.',
  '42P07': 'Objeto duplicado.',
  '42712': 'Alias duplicado.',
  '42710': 'Objeto duplicado.',
  '42702': 'Referência de coluna ambígua.',
  '42725': 'Referência de função ambígua.',
  '42P08': 'Referência de parâmetro ambígua.',
  '42P09': 'Referência ambígua.',
  '42P10': 'Referência de grupo inválida.',
  '42611': 'Definição de coluna inválida.',
  '42P11': 'Definição de cursor inválida.',
  '42P12': 'Definição de banco de dados inválida.',
  '42P13': 'Definição de função inválida.',
  '42P14': 'Definição de esquema inválida.',
  '42P15': 'Definição de tabela inválida.',
  '42P16': 'Definição de objeto inválida.',
  '42P17': 'Definição de objeto inválida.',

  // Class 44 — WITH CHECK OPTION Violation
  '44000': 'Violação de WITH CHECK OPTION.',

  // Class 53 — Insufficient Resources
  '53000': 'Recursos insuficientes.',
  '53100': 'Disco cheio.',
  '53200': 'Memória insuficiente.',
  '53300': 'Muitas conexões.',
  '53400': 'Configuração limitada.',

  // Class 54 — Program Limit Exceeded
  '54000': 'Limite do programa excedido.',
  '54001': 'Declaração muito complexa.',
  '54011': 'Muitas colunas.',
  '54023': 'Muitos argumentos.',

  // Class 55 — Object Not In Prerequisite State
  '55000': 'Objeto não está no estado necessário.',
  '55006': 'Objeto em uso.',
  '55P02': 'Não é possível alterar parâmetros em tempo de execução.',
  '55P03': 'Bloqueio não disponível.',

  // Class 57 — Operator Intervention
  '57000': 'Intervenção do operador.',
  '57014': 'A operação demorou muito tempo. Tente novamente.',
  '57P01': 'Desligamento do administrador.',
  '57P02': 'Parada de emergência.',
  '57P03': 'Não é possível conectar agora.',
  '57P04': 'Banco de dados não aceita conexões.',

  // Class 58 — System Error (external to PostgreSQL)
  '58000': 'Erro do sistema.',
  '58030': 'Erro de E/S.',
  '58P01': 'Arquivo indefinido.',
  '58P02': 'Erro na duplicação de arquivo.',

  // Class F0 — Configuration File Error
  'F0000': 'Erro no arquivo de configuração.',
  'F0001': 'Bloqueio de arquivo falhou.',

  // Class HV — Foreign Data Wrapper Error
  'HV000': 'Erro no wrapper de dados estrangeiros.',
  'HV005': 'Não é possível criar execução.',
  'HV002': 'Não é possível criar contexto.',
  'HV010': 'Dados inválidos.',
  'HV021': 'Valor de atributo inválido.',
  'HV024': 'Declaração inválida.',
  'HV007': 'Descritor de memória inválido.',
  'HV008': 'Dados inválidos.',
  'HV004': 'Tipo de dados inválido.',
  'HV006': 'Tipo de retorno inválido.',
  'HV091': 'Descritor de campo inválido.',
  'HV00B': 'Valor de opção inválido.',
  'HV00C': 'Nome de opção inválido.',
  'HV00D': 'Descritor de opção inválido.',
  'HV090': 'Descritor de coluna inválido.',
  'HV00J': 'Nome de servidor estrangeiro inválido.',
  'HV00K': 'Resposta inválida.',
  'HV00Q': 'Esquema inválido.',
  'HV00R': 'Nome de tabela inválido.',
  'HV00L': 'Contexto de autorização inválido.',
  'HV00M': 'Especificação de tipo de dados inválida.',
  'HV00N': 'Indicador de array inválido.',
  'HV009': 'Indicador inválido.',
  'HV014': 'Limite de array inválido.',
  'HV001': 'Memória insuficiente.',
  'HV00P': 'Parâmetros de função indefinidos.',
  'HV00A': 'Opção indefinida.',

  // Class P0 — PL/pgSQL Error
  'P0000': 'Erro no PL/pgSQL.',
  'P0001': 'Exceção gerada.',
  'P0002': 'Nenhum dado encontrado.',
  'P0003': 'Muitas linhas.',

  // Class XX — Internal Error
  'XX000': 'Erro interno.',
  'XX001': 'Erro de corrupção de dados.',
  'XX002': 'Erro de índice corrompido.',
};

/**
 * Mapeamento específico para campos comuns
 */
const fieldSpecificMessages: Record<string, string> = {
  'email': 'Este e-mail já está cadastrado.',
  'cpf': 'Este CPF já está cadastrado.',
  'cnpj': 'Este CNPJ já está cadastrado.',
  'phone': 'Este telefone já está cadastrado.',
  'name': 'Este nome já está em uso.',
  'username': 'Este nome de usuário já está em uso.',
  'code': 'Este código já está em uso.',
  'slug': 'Este identificador já está em uso.',
  'tax_id': 'Este documento já está cadastrado.',
  'registration': 'Esta matrícula já está em uso.',
  'license': 'Esta licença já está em uso.',
};

/**
 * Converte erro do PostgreSQL em erro amigável ao usuário
 * 
 * @param error - Erro original do PostgreSQL
 * @returns Erro formatado com mensagem amigável
 * 
 * @example
 * ```typescript
 * try {
 *   await db.insert(users).values(userData);
 * } catch (error) {
 *   const friendlyError = handleDatabaseError(error);
 *   return { success: false, error: friendlyError.message };
 * }
 * ```
 */
export function handleDatabaseError(error: any): AppError {
  // Se não for erro do PostgreSQL, retorna erro genérico
  if (!error?.code || typeof error.code !== 'string') {
    console.error('Erro de banco sem código:', error);
    return new AppError('Erro ao processar operação no banco de dados.', 'DATABASE_ERROR');
  }

  // Procura mensagem específica para o código
  const message = postgresErrorMap[error.code];
  
  if (message) {
    // Tratamento especial para violação de chave única (duplicação)
    if (error.code === '23505' && error.detail) {
      const extractedInfo = extractConstraintInfo(error.detail);
      if (extractedInfo) {
        const fieldMessage = fieldSpecificMessages[extractedInfo.field];
        if (fieldMessage) {
          return new ValidationError(fieldMessage, extractedInfo.field);
        }
        
        // Se não tiver mensagem específica, usa a genérica com o campo
        return new ValidationError(`${extractedInfo.field} já está em uso.`, extractedInfo.field);
      }
    }

    // Tratamento especial para violação de NOT NULL
    if (error.code === '23502' && error.column) {
      const fieldName = getFieldDisplayName(error.column);
      return new ValidationError(`O campo "${fieldName}" é obrigatório.`, error.column);
    }

    // Tratamento especial para violação de chave estrangeira
    if (error.code === '23503' && error.detail) {
      const fkInfo = extractForeignKeyInfo(error.detail);
      if (fkInfo) {
        return new ValidationError(
          `Não é possível realizar esta operação pois o registro está sendo usado em "${fkInfo.table}".`,
          fkInfo.field
        );
      }
    }

    // Retorna erro com a mensagem mapeada
    return new DatabaseError(message);
  }

  // Erro desconhecido - loga para investigação
  console.error('Erro de banco não mapeado:', {
    code: error.code,
    message: error.message,
    detail: error.detail,
    hint: error.hint,
    position: error.position,
    internalPosition: error.internalPosition,
    internalQuery: error.internalQuery,
    where: error.where,
    schema: error.schema,
    table: error.table,
    column: error.column,
    dataType: error.dataType,
    constraint: error.constraint,
  });

  return new AppError('Erro inesperado no banco de dados. Tente novamente.', 'DATABASE_ERROR');
}

/**
 * Extrai informações de violação de constraint única
 */
function extractConstraintInfo(detail: string): { field: string; value?: string } | null {
  // Padrão: Key (campo)=(valor) already exists.
  const match = detail.match(/Key \((.+?)\)=\((.+?)\)/);
  if (match) {
    return {
      field: match[1],
      value: match[2]
    };
  }

  // Padrão alternativo: Key (campo)=(valor) already exists.
  const simpleMatch = detail.match(/Key \((.+?)\)/);
  if (simpleMatch) {
    return {
      field: simpleMatch[1]
    };
  }

  return null;
}

/**
 * Extrai informações de violação de chave estrangeira
 */
function extractForeignKeyInfo(detail: string): { field: string; table: string } | null {
  // Padrão: Key (campo)=(valor) is not present in table "tabela".
  const match = detail.match(/Key \((.+?)\)=.+?is not present in table "(.+?)"/);
  if (match) {
    return {
      field: match[1],
      table: match[2]
    };
  }

  return null;
}

/**
 * Converte nome técnico do campo para nome amigável
 */
function getFieldDisplayName(fieldName: string): string {
  const displayNames: Record<string, string> = {
    'email': 'E-mail',
    'password': 'Senha',
    'name': 'Nome',
    'phone': 'Telefone',
    'cpf': 'CPF',
    'cnpj': 'CNPJ',
    'tax_id': 'Documento',
    'birth_date': 'Data de nascimento',
    'created_at': 'Data de criação',
    'updated_at': 'Data de atualização',
    'is_active': 'Status ativo',
    'agency_id': 'Agência',
    'user_id': 'Usuário',
    'client_id': 'Cliente',
    'description': 'Descrição',
    'address': 'Endereço',
    'city': 'Cidade',
    'state': 'Estado',
    'zip_code': 'CEP',
    'country': 'País',
    'website': 'Website',
    'linkedin': 'LinkedIn',
    'instagram': 'Instagram',
    'facebook': 'Facebook',
    'twitter': 'Twitter',
    'company_size': 'Tamanho da empresa',
    'annual_revenue': 'Receita anual',
    'industry': 'Setor',
    'role': 'Função',
    'department': 'Departamento',
    'salary': 'Salário',
    'start_date': 'Data de início',
    'end_date': 'Data de término',
  };

  return displayNames[fieldName] || fieldName;
}

/**
 * Verifica se um erro é específico do PostgreSQL
 */
export function isPostgresError(error: any): boolean {
  return !!(error?.code && typeof error.code === 'string' && error.code.length === 5);
}

/**
 * Obtém categoria do erro PostgreSQL baseado no código
 */
export function getPostgresErrorCategory(code: string): string {
  const prefix = code.substring(0, 2);
  
  const categories: Record<string, string> = {
    '08': 'Erro de Conexão',
    '22': 'Erro nos Dados',
    '23': 'Violação de Integridade',
    '25': 'Estado de Transação Inválido',
    '28': 'Autorização Inválida',
    '40': 'Transação Cancelada',
    '42': 'Erro de Sintaxe ou Acesso',
    '53': 'Recursos Insuficientes',
    '54': 'Limite Excedido',
    '57': 'Intervenção do Operador',
    '58': 'Erro do Sistema',
    'P0': 'Erro de PL/pgSQL',
    'XX': 'Erro Interno',
  };

  return categories[prefix] || 'Erro Desconhecido';
}
