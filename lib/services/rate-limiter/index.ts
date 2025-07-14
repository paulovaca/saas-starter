import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { RateLimitError } from '../error-handler';

// Configuração para desenvolvimento (usa memória local)
const ratelimitMemory = new Map();

/**
 * Configuração de rate limiting
 */
export interface RateLimitConfig {
  action: string;
  limit?: number;
  window?: string;
}

/**
 * Converte string de tempo para millisegundos
 */
function parseTimeWindow(window: string): number {
  const match = window.match(/^(\d+)([smhd])$/);
  if (!match) {
    throw new Error(`Invalid time window format: ${window}`);
  }
  
  const [, value, unit] = match;
  const num = parseInt(value, 10);
  
  switch (unit) {
    case 's': return num * 1000;
    case 'm': return num * 60 * 1000;
    case 'h': return num * 60 * 60 * 1000;
    case 'd': return num * 24 * 60 * 60 * 1000;
    default: throw new Error(`Invalid time unit: ${unit}`);
  }
}

/**
 * Sistema de Rate Limiting para proteger contra spam e ataques
 * 
 * @example
 * ```typescript
 * import { rateLimiter } from '@/lib/services/rate-limiter';
 * 
 * // Verificar limite para login
 * await rateLimiter.check('192.168.1.1', 'sign-in', { limit: 5, window: '10m' });
 * ```
 */
class RateLimiter {
  private limiter: Ratelimit | null = null;

  constructor() {
    // Se tiver Redis configurado, usa ele
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      const redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      });

      this.limiter = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 requisições por minuto
      });
    }
  }

  /**
   * Verifica se o identificador pode executar a ação
   * 
   * @param identifier - IP ou ID do usuário
   * @param action - Tipo de ação (ex: 'sign-in', 'sign-up')
   * @param config - Configuração de limite
   * @throws {Error} Se exceder o limite de tentativas
   */
  async check(identifier: string, action: string, config: { limit?: number; window?: string } = {}): Promise<void> {
    const { limit = 10, window = '1m' } = config;
    
    // Em desenvolvimento, usa um limitador simples em memória
    if (!this.limiter) {
      const key = `${identifier}:${action}`;
      const now = Date.now();
      const windowMs = parseTimeWindow(window);

      // Pega ou cria array de timestamps
      const timestamps = ratelimitMemory.get(key) || [];
      
      // Remove timestamps antigos
      const validTimestamps = timestamps.filter((ts: number) => now - ts < windowMs);
      
      if (validTimestamps.length >= limit) {
        throw new RateLimitError('Muitas tentativas. Aguarde alguns minutos.');
      }

      validTimestamps.push(now);
      ratelimitMemory.set(key, validTimestamps);
      return;
    }

    // Usa o Redis em produção
    const { success } = await this.limiter.limit(`${identifier}:${action}`);
    if (!success) {
      throw new RateLimitError('Muitas tentativas. Aguarde alguns minutos.');
    }
  }

  /**
   * Limpa o rate limit para um identificador específico
   * Útil para testes ou quando necessário resetar
   */
  async reset(identifier: string, action: string): Promise<void> {
    if (!this.limiter) {
      const key = `${identifier}:${action}`;
      ratelimitMemory.delete(key);
      return;
    }

    // Para Redis, não há método direto de reset, mas podemos usar um timestamp futuro
    // ou aguardar o TTL natural
  }

  /**
   * Limpa todo o cache em memória (útil para testes)
   */
  clearMemoryCache(): void {
    ratelimitMemory.clear();
  }
}

export const rateLimiter = new RateLimiter();
