import { taggedCache } from '../../lib/services/cache/tagged-cache';
import { CacheManager } from '../../lib/services/cache/manager';

// Mock das dependências do Upstash para evitar problemas com ES modules nos testes
jest.mock('@upstash/ratelimit', () => ({}));
jest.mock('@upstash/redis', () => ({}));

describe('Sistema de Cache Melhorado', () => {
  beforeEach(() => {
    // Limpa o cache antes de cada teste
    jest.clearAllMocks();
  });

  describe('CacheManager', () => {
    const cache = CacheManager.getInstance();

    test('deve ser um singleton', () => {
      const cache1 = CacheManager.getInstance();
      const cache2 = CacheManager.getInstance();
      expect(cache1).toBe(cache2);
    });

    test('deve armazenar e recuperar valores', async () => {
      const testData = { name: 'Test User', id: '123' };
      
      await cache.set('test-key', testData, 60);
      const result = await cache.get('test-key');
      
      expect(result).toEqual(testData);
    });

    test('deve retornar null para chaves inexistentes', async () => {
      const result = await cache.get('non-existent-key');
      expect(result).toBeNull();
    });

    test('deve verificar se chave existe', async () => {
      await cache.set('exists-key', 'test-value', 60);
      
      const exists = await cache.has('exists-key');
      const notExists = await cache.has('not-exists-key');
      
      expect(exists).toBe(true);
      expect(notExists).toBe(false);
    });

    test('deve deletar chaves', async () => {
      await cache.set('delete-key', 'test-value', 60);
      
      expect(await cache.has('delete-key')).toBe(true);
      
      await cache.delete('delete-key');
      
      expect(await cache.has('delete-key')).toBe(false);
    });

    test('deve implementar padrão remember', async () => {
      let callCount = 0;
      const fetchFn = jest.fn(async () => {
        callCount++;
        return { data: 'fetched-data', callCount };
      });

      // Primeira chamada deve executar a função
      const result1 = await cache.remember('remember-key', fetchFn, 60);
      expect(result1.callCount).toBe(1);
      expect(fetchFn).toHaveBeenCalledTimes(1);

      // Segunda chamada deve usar o cache
      const result2 = await cache.remember('remember-key', fetchFn, 60);
      expect(result2.callCount).toBe(1); // Mesmo valor do cache
      expect(fetchFn).toHaveBeenCalledTimes(1); // Não foi chamada novamente
    });

    test('deve limpar todo o cache', async () => {
      await cache.set('key1', 'value1', 60);
      await cache.set('key2', 'value2', 60);
      
      expect(await cache.has('key1')).toBe(true);
      expect(await cache.has('key2')).toBe(true);
      
      await cache.clear();
      
      expect(await cache.has('key1')).toBe(false);
      expect(await cache.has('key2')).toBe(false);
    });
  });

  describe('TaggedCache', () => {
    beforeEach(async () => {
      await taggedCache.clear();
    });

    test('deve armazenar valores com tags', async () => {
      const userData = { name: 'John Doe', id: '123' };
      
      await taggedCache.set('user:123', userData, {
        ttl: 60,
        tags: ['users', 'user:123']
      });
      
      const result = await taggedCache.get('user:123');
      expect(result).toEqual(userData);
    });

    test('deve implementar padrão remember com tags', async () => {
      let callCount = 0;
      const fetchFn = jest.fn(async () => {
        callCount++;
        return { name: 'Jane Doe', id: '456', callCount };
      });

      // Primeira chamada
      const result1 = await taggedCache.remember(
        'user:456',
        fetchFn,
        { ttl: 60, tags: ['users', 'user:456'] }
      );
      expect(result1.callCount).toBe(1);

      // Segunda chamada deve usar cache
      const result2 = await taggedCache.remember(
        'user:456',
        fetchFn,
        { ttl: 60, tags: ['users', 'user:456'] }
      );
      expect(result2.callCount).toBe(1);
      expect(fetchFn).toHaveBeenCalledTimes(1);
    });

    test('deve invalidar cache por tag', async () => {
      // Adiciona múltiplos usuários
      await taggedCache.set('user:1', { name: 'User 1' }, {
        tags: ['users', 'user:1']
      });
      await taggedCache.set('user:2', { name: 'User 2' }, {
        tags: ['users', 'user:2']
      });
      await taggedCache.set('admin:1', { name: 'Admin 1' }, {
        tags: ['admins', 'admin:1']
      });

      // Verifica que existem
      expect(await taggedCache.get('user:1')).not.toBeNull();
      expect(await taggedCache.get('user:2')).not.toBeNull();
      expect(await taggedCache.get('admin:1')).not.toBeNull();

      // Invalida apenas usuários
      const deleted = await taggedCache.invalidateTag('users');
      expect(deleted).toBeGreaterThan(0);

      // Usuários devem ter sido removidos
      expect(await taggedCache.get('user:1')).toBeNull();
      expect(await taggedCache.get('user:2')).toBeNull();
      
      // Admin deve permanecer
      expect(await taggedCache.get('admin:1')).not.toBeNull();
    });

    test('deve invalidar múltiplas tags', async () => {
      await taggedCache.set('user:1', { name: 'User 1' }, {
        tags: ['users', 'active']
      });
      await taggedCache.set('user:2', { name: 'User 2' }, {
        tags: ['users', 'inactive']
      });
      await taggedCache.set('product:1', { name: 'Product 1' }, {
        tags: ['products', 'active']
      });

      const deleted = await taggedCache.invalidateTags(['users', 'products']);
      expect(deleted).toBeGreaterThan(0);

      expect(await taggedCache.get('user:1')).toBeNull();
      expect(await taggedCache.get('user:2')).toBeNull();
      expect(await taggedCache.get('product:1')).toBeNull();
    });

    test('deve usar métodos de conveniência para usuários', async () => {
      const userData = { name: 'Test User', email: 'test@example.com' };
      
      await taggedCache.cacheUser('123', userData, 300);
      
      const result = await taggedCache.get('user:123');
      expect(result).toEqual(userData);
      
      // Invalida usuário
      await taggedCache.invalidateUser('123');
      
      const afterInvalidation = await taggedCache.get('user:123');
      expect(afterInvalidation).toBeNull();
    });

    test('deve usar métodos de conveniência para agências', async () => {
      const agencyData = { name: 'Test Agency', email: 'agency@example.com' };
      
      await taggedCache.cacheAgency('agency-123', agencyData, 600);
      
      const result = await taggedCache.get('agency:agency-123');
      expect(result).toEqual(agencyData);
      
      // Invalida agência
      await taggedCache.invalidateAgency('agency-123');
      
      const afterInvalidation = await taggedCache.get('agency:agency-123');
      expect(afterInvalidation).toBeNull();
    });

    test('deve listar chaves para uma tag', async () => {
      await taggedCache.set('user:1', { name: 'User 1' }, {
        tags: ['test-tag']
      });
      await taggedCache.set('user:2', { name: 'User 2' }, {
        tags: ['test-tag']
      });

      const keys = await taggedCache.getKeysForTag('test-tag');
      expect(keys).toContain('user:1');
      expect(keys).toContain('user:2');
    });
  });

  describe('Integração com queries de banco', () => {
    test('deve simular cache em queries de usuário', async () => {
      const mockGetUserFromDB = jest.fn(async (userId: string) => {
        return {
          id: userId,
          name: 'Database User',
          email: 'user@db.com'
        };
      });

      // Primeira chamada
      const user1 = await taggedCache.remember(
        `user:${123}`,
        () => mockGetUserFromDB('123'),
        { ttl: 300, tags: ['users', 'user:123'] }
      );

      expect(mockGetUserFromDB).toHaveBeenCalledTimes(1);
      expect(user1.name).toBe('Database User');

      // Segunda chamada deve usar cache
      const user2 = await taggedCache.remember(
        `user:${123}`,
        () => mockGetUserFromDB('123'),
        { ttl: 300, tags: ['users', 'user:123'] }
      );

      expect(mockGetUserFromDB).toHaveBeenCalledTimes(1); // Não chamou novamente
      expect(user2).toEqual(user1);
    });
  });
});
