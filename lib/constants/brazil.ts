// Estados brasileiros
export const BRAZILIAN_STATES = [
  { code: 'AC', name: 'Acre' },
  { code: 'AL', name: 'Alagoas' },
  { code: 'AP', name: 'Amapá' },
  { code: 'AM', name: 'Amazonas' },
  { code: 'BA', name: 'Bahia' },
  { code: 'CE', name: 'Ceará' },
  { code: 'DF', name: 'Distrito Federal' },
  { code: 'ES', name: 'Espírito Santo' },
  { code: 'GO', name: 'Goiás' },
  { code: 'MA', name: 'Maranhão' },
  { code: 'MT', name: 'Mato Grosso' },
  { code: 'MS', name: 'Mato Grosso do Sul' },
  { code: 'MG', name: 'Minas Gerais' },
  { code: 'PA', name: 'Pará' },
  { code: 'PB', name: 'Paraíba' },
  { code: 'PR', name: 'Paraná' },
  { code: 'PE', name: 'Pernambuco' },
  { code: 'PI', name: 'Piauí' },
  { code: 'RJ', name: 'Rio de Janeiro' },
  { code: 'RN', name: 'Rio Grande do Norte' },
  { code: 'RS', name: 'Rio Grande do Sul' },
  { code: 'RO', name: 'Rondônia' },
  { code: 'RR', name: 'Roraima' },
  { code: 'SC', name: 'Santa Catarina' },
  { code: 'SP', name: 'São Paulo' },
  { code: 'SE', name: 'Sergipe' },
  { code: 'TO', name: 'Tocantins' },
] as const;

// Regiões brasileiras
export const BRAZILIAN_REGIONS = [
  { code: 'N', name: 'Norte', states: ['AC', 'AM', 'AP', 'PA', 'RO', 'RR', 'TO'] },
  { code: 'NE', name: 'Nordeste', states: ['AL', 'BA', 'CE', 'MA', 'PB', 'PE', 'PI', 'RN', 'SE'] },
  { code: 'CO', name: 'Centro-Oeste', states: ['DF', 'GO', 'MT', 'MS'] },
  { code: 'SE', name: 'Sudeste', states: ['ES', 'MG', 'RJ', 'SP'] },
  { code: 'S', name: 'Sul', states: ['PR', 'RS', 'SC'] },
] as const;

export type BrazilianState = typeof BRAZILIAN_STATES[number]['code'];
export type BrazilianRegion = typeof BRAZILIAN_REGIONS[number]['code'];