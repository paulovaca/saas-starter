/**
 * Validates a Brazilian CPF (Cadastro de Pessoas Físicas)
 */
export function validateCPF(cpf: string): boolean {
  // Remove formatting
  const cleanCpf = cpf.replace(/[^\d]/g, '');
  
  // Check if it has 11 digits
  if (cleanCpf.length !== 11) return false;
  
  // Check if all digits are the same
  if (/^(\d)\1{10}$/.test(cleanCpf)) return false;
  
  // Validate first check digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCpf.charAt(i)) * (10 - i);
  }
  
  let remainder = sum % 11;
  let checkDigit1 = remainder < 2 ? 0 : 11 - remainder;
  
  if (checkDigit1 !== parseInt(cleanCpf.charAt(9))) return false;
  
  // Validate second check digit
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCpf.charAt(i)) * (11 - i);
  }
  
  remainder = sum % 11;
  let checkDigit2 = remainder < 2 ? 0 : 11 - remainder;
  
  return checkDigit2 === parseInt(cleanCpf.charAt(10));
}

/**
 * Validates a Brazilian CNPJ (Cadastro Nacional de Pessoas Jurídicas)
 */
export function validateCNPJ(cnpj: string): boolean {
  // Remove formatting
  const cleanCnpj = cnpj.replace(/[^\d]/g, '');
  
  // Check if it has 14 digits
  if (cleanCnpj.length !== 14) return false;
  
  // Check if all digits are the same
  if (/^(\d)\1{13}$/.test(cleanCnpj)) return false;
  
  // Validate first check digit
  let sum = 0;
  let weight = 5;
  
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleanCnpj.charAt(i)) * weight;
    weight = weight === 2 ? 9 : weight - 1;
  }
  
  let remainder = sum % 11;
  let checkDigit1 = remainder < 2 ? 0 : 11 - remainder;
  
  if (checkDigit1 !== parseInt(cleanCnpj.charAt(12))) return false;
  
  // Validate second check digit
  sum = 0;
  weight = 6;
  
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cleanCnpj.charAt(i)) * weight;
    weight = weight === 2 ? 9 : weight - 1;
  }
  
  remainder = sum % 11;
  let checkDigit2 = remainder < 2 ? 0 : 11 - remainder;
  
  return checkDigit2 === parseInt(cleanCnpj.charAt(13));
}

/**
 * Formats a CEP (Brazilian postal code)
 */
export function formatCEP(cep: string): string {
  const cleanCep = cep.replace(/[^\d]/g, '');
  
  if (cleanCep.length <= 5) {
    return cleanCep;
  }
  
  return cleanCep.replace(/(\d{5})(\d)/, '$1-$2');
}

/**
 * Formats a CPF
 */
export function formatCPF(cpf: string): string {
  const cleanCpf = cpf.replace(/[^\d]/g, '');
  
  if (cleanCpf.length <= 3) {
    return cleanCpf;
  } else if (cleanCpf.length <= 6) {
    return cleanCpf.replace(/(\d{3})(\d)/, '$1.$2');
  } else if (cleanCpf.length <= 9) {
    return cleanCpf.replace(/(\d{3})(\d{3})(\d)/, '$1.$2.$3');
  } else {
    return cleanCpf.replace(/(\d{3})(\d{3})(\d{3})(\d)/, '$1.$2.$3-$4');
  }
}

/**
 * Formats a CNPJ
 */
export function formatCNPJ(cnpj: string): string {
  const cleanCnpj = cnpj.replace(/[^\d]/g, '');
  
  if (cleanCnpj.length <= 2) {
    return cleanCnpj;
  } else if (cleanCnpj.length <= 5) {
    return cleanCnpj.replace(/(\d{2})(\d)/, '$1.$2');
  } else if (cleanCnpj.length <= 8) {
    return cleanCnpj.replace(/(\d{2})(\d{3})(\d)/, '$1.$2.$3');
  } else if (cleanCnpj.length <= 12) {
    return cleanCnpj.replace(/(\d{2})(\d{3})(\d{3})(\d)/, '$1.$2.$3/$4');
  } else {
    return cleanCnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d)/, '$1.$2.$3/$4-$5');
  }
}

/**
 * Formats a phone number
 */
export function formatPhone(phone: string): string {
  const cleanPhone = phone.replace(/[^\d]/g, '');
  
  if (cleanPhone.length <= 2) {
    return cleanPhone;
  } else if (cleanPhone.length <= 6) {
    return cleanPhone.replace(/(\d{2})(\d)/, '($1) $2');
  } else if (cleanPhone.length <= 10) {
    return cleanPhone.replace(/(\d{2})(\d{4})(\d)/, '($1) $2-$3');
  } else {
    return cleanPhone.replace(/(\d{2})(\d{5})(\d)/, '($1) $2-$3');
  }
}