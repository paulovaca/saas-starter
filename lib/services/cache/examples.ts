import { taggedCache } from '@/lib/services/cache/tagged-cache';
import { CacheManager } from '@/lib/services/cache/manager';

/**
 * Exemplos de uso do sistema de cache melhorado
 */

// Instância do cache manager
const cache = CacheManager.getInstance();

/**
 * Função exemplo para buscar e cachear dados de usuário
 */
export async function getCachedUser(userId: string) {
  return taggedCache.remember(
    `user:${userId}`,
    async () => {
      // Simula busca no banco de dados
      console.log(`Buscando usuário ${userId} do banco de dados...`);
      
      // Aqui seria a chamada real ao banco
      const user = {
        id: userId,
        name: 'João Silva',
        email: 'joao@example.com',
        agencyId: 'agency-123'
      };
      
      return user;
    },
    {
      ttl: 300, // 5 minutos
      tags: ['users', `user:${userId}`]
    }
  );
}

/**
 * Função exemplo para atualizar usuário e invalidar cache
 */
export async function updateUser(userId: string, data: any) {
  // Simula atualização no banco
  console.log(`Atualizando usuário ${userId}...`);
  
  const result = {
    id: userId,
    ...data,
    updatedAt: new Date()
  };
  
  // Invalida todos os caches relacionados a usuários
  await taggedCache.invalidateTag('users');
  await taggedCache.invalidateTag(`user:${userId}`);
  
  return result;
}

/**
 * Função exemplo para cachear dados de agência
 */
export async function getCachedAgency(agencyId: string) {
  return taggedCache.remember(
    `agency:${agencyId}`,
    async () => {
      console.log(`Buscando agência ${agencyId} do banco de dados...`);
      
      return {
        id: agencyId,
        name: 'Minha Agência',
        email: 'contato@agencia.com',
        isActive: true
      };
    },
    {
      ttl: 600, // 10 minutos
      tags: ['agencies', `agency:${agencyId}`]
    }
  );
}

/**
 * Função exemplo para buscar lista de clientes com paginação
 */
export async function getCachedClients(agencyId: string, page: number = 1) {
  return taggedCache.remember(
    `clients:${agencyId}:page:${page}`,
    async () => {
      console.log(`Buscando clientes da agência ${agencyId}, página ${page}...`);
      
      return {
        clients: [
          { id: '1', name: 'Cliente 1', email: 'cliente1@test.com' },
          { id: '2', name: 'Cliente 2', email: 'cliente2@test.com' },
        ],
        pagination: {
          currentPage: page,
          totalPages: 5,
          totalItems: 50
        }
      };
    },
    {
      ttl: 180, // 3 minutos
      tags: ['clients', `agency:${agencyId}`, `clients:${agencyId}`]
    }
  );
}

/**
 * Função exemplo para invalidar todos os dados de uma agência
 */
export async function invalidateAgencyData(agencyId: string) {
  console.log(`Invalidando todos os dados da agência ${agencyId}...`);
  
  const deleted = await taggedCache.invalidateTags([
    'agencies',
    `agency:${agencyId}`,
    `clients:${agencyId}`,
    `users:agency:${agencyId}`
  ]);
  
  console.log(`${deleted} entradas de cache removidas`);
  return deleted;
}

/**
 * Função exemplo para busca com cache de curta duração
 */
export async function getRecentActivities(agencyId: string) {
  return taggedCache.remember(
    `activities:recent:${agencyId}`,
    async () => {
      console.log(`Buscando atividades recentes da agência ${agencyId}...`);
      
      return [
        { id: '1', action: 'LOGIN', user: 'João', timestamp: new Date() },
        { id: '2', action: 'CREATE_CLIENT', user: 'Maria', timestamp: new Date() },
      ];
    },
    {
      ttl: 60, // 1 minuto (dados que mudam frequentemente)
      tags: ['activities', `agency:${agencyId}`]
    }
  );
}

/**
 * Função exemplo para cache de configurações
 */
export async function getCachedSettings(agencyId: string) {
  return taggedCache.remember(
    `settings:${agencyId}`,
    async () => {
      console.log(`Buscando configurações da agência ${agencyId}...`);
      
      return {
        theme: 'light',
        emailNotifications: true,
        language: 'pt-BR',
        timezone: 'America/Sao_Paulo'
      };
    },
    {
      ttl: 3600, // 1 hora (dados que raramente mudam)
      tags: ['settings', `agency:${agencyId}`]
    }
  );
}

/**
 * Exemplo de uso do cache simples sem tags
 */
export async function getWeatherData(city: string) {
  return cache.remember(
    `weather:${city}`,
    async () => {
      console.log(`Buscando dados do tempo para ${city}...`);
      
      // Simula chamada a API externa
      return {
        city,
        temperature: 25,
        condition: 'sunny',
        humidity: 60
      };
    },
    300 // 5 minutos
  );
}

/**
 * Exemplo de cache para dados computacionalmente caros
 */
export async function getExpensiveCalculation(params: string) {
  return cache.remember(
    `calculation:${params}`,
    async () => {
      console.log(`Executando cálculo caro para ${params}...`);
      
      // Simula processamento demorado
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        result: Math.random() * 1000,
        calculatedAt: new Date(),
        params
      };
    },
    1800 // 30 minutos
  );
}
