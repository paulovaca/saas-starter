/**
 * Validações específicas para dados brasileiros
 */

/**
 * Valida um CPF brasileiro
 */
export function validateCPF(cpf: string): boolean {
  // Remove caracteres não numéricos
  cpf = cpf.replace(/[^\d]/g, '')

  // Verifica se tem 11 dígitos
  if (cpf.length !== 11) return false

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cpf)) return false

  // Validação do primeiro dígito verificador
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i)
  }
  let remainder = (sum * 10) % 11
  if (remainder === 10) remainder = 0
  if (remainder !== parseInt(cpf.charAt(9))) return false

  // Validação do segundo dígito verificador
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i)
  }
  remainder = (sum * 10) % 11
  if (remainder === 10) remainder = 0
  if (remainder !== parseInt(cpf.charAt(10))) return false

  return true
}

/**
 * Valida um CNPJ brasileiro
 */
export function validateCNPJ(cnpj: string): boolean {
  // Remove caracteres não numéricos
  cnpj = cnpj.replace(/[^\d]/g, '')

  // Verifica se tem 14 dígitos
  if (cnpj.length !== 14) return false

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{13}$/.test(cnpj)) return false

  // Validação do primeiro dígito verificador
  let sum = 0
  let pos = 5
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cnpj.charAt(i)) * pos
    pos = pos === 2 ? 9 : pos - 1
  }
  let remainder = sum % 11
  if (remainder < 2) remainder = 0
  else remainder = 11 - remainder
  if (remainder !== parseInt(cnpj.charAt(12))) return false

  // Validação do segundo dígito verificador
  sum = 0
  pos = 6
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cnpj.charAt(i)) * pos
    pos = pos === 2 ? 9 : pos - 1
  }
  remainder = sum % 11
  if (remainder < 2) remainder = 0
  else remainder = 11 - remainder
  if (remainder !== parseInt(cnpj.charAt(13))) return false

  return true
}

/**
 * Formata um CPF
 */
export function formatCPF(cpf: string): string {
  cpf = cpf.replace(/[^\d]/g, '')
  if (cpf.length !== 11) return cpf
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

/**
 * Formata um CNPJ
 */
export function formatCNPJ(cnpj: string): string {
  cnpj = cnpj.replace(/[^\d]/g, '')
  if (cnpj.length !== 14) return cnpj
  return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
}

/**
 * Formata um CEP
 */
export function formatCEP(cep: string): string {
  cep = cep.replace(/[^\d]/g, '')
  if (cep.length !== 8) return cep
  return cep.replace(/(\d{5})(\d{3})/, '$1-$2')
}

/**
 * Formata um telefone brasileiro
 */
export function formatPhone(phone: string): string {
  phone = phone.replace(/[^\d]/g, '')
  
  if (phone.length === 10) {
    // Telefone fixo: (11) 3456-7890
    return phone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  } else if (phone.length === 11) {
    // Celular: (11) 98765-4321
    return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  }
  
  return phone
}

/**
 * Valida um CEP brasileiro
 */
export function validateCEP(cep: string): boolean {
  cep = cep.replace(/[^\d]/g, '')
  return cep.length === 8
}