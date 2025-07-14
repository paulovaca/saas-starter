import { rateLimiter } from '../../lib/services/rate-limiter';

// Mock das dependências do Upstash para evitar problemas com ES modules nos testes
jest.mock('@upstash/ratelimit', () => ({}));
jest.mock('@upstash/redis', () => ({}));

describe('Rate Limiter', () => {
  beforeEach(() => {
    // Como estamos usando cache em memória para testes,
    // vamos aguardar um pouco entre testes para evitar interferência
    jest.clearAllMocks();
  });

  test('deve permitir requisições dentro do limite', async () => {
    const identifier = 'test-ip-1';
    const action = 'test-action-1';

    // Primeira tentativa deve passar
    await expect(rateLimiter.check(identifier, action)).resolves.not.toThrow();
    
    // Segunda tentativa deve passar
    await expect(rateLimiter.check(identifier, action)).resolves.not.toThrow();
  });

  test('deve bloquear quando exceder o limite', async () => {
    const identifier = 'test-ip-2';
    const action = 'test-action-2';

    // Faz 10 tentativas (limite padrão)
    for (let i = 0; i < 10; i++) {
      await rateLimiter.check(identifier, action);
    }

    // A 11ª tentativa deve falhar
    await expect(rateLimiter.check(identifier, action))
      .rejects
      .toThrow('Muitas tentativas. Aguarde alguns minutos.');
  });

  test('deve permitir diferentes ações independentemente', async () => {
    const identifier = 'test-ip-3';

    // Esgota limite para ação 1
    for (let i = 0; i < 10; i++) {
      await rateLimiter.check(identifier, 'action-3a');
    }

    // Ação 2 ainda deve funcionar
    await expect(rateLimiter.check(identifier, 'action-3b'))
      .resolves
      .not.toThrow();
  });

  test('deve permitir diferentes IPs independentemente', async () => {
    const action = 'test-action-4';

    // Esgota limite para IP 1
    for (let i = 0; i < 10; i++) {
      await rateLimiter.check('ip-4a', action);
    }

    // IP 2 ainda deve funcionar
    await expect(rateLimiter.check('ip-4b', action))
      .resolves
      .not.toThrow();
  });

  test('deve limpar timestamps expirados', async () => {
    const identifier = 'test-ip-5';
    const action = 'test-action-5';

    // Mock do Date.now para simular passagem de tempo
    const originalNow = Date.now;
    let currentTime = Date.now();
    Date.now = jest.fn(() => currentTime);

    try {
      // Faz 10 tentativas
      for (let i = 0; i < 10; i++) {
        await rateLimiter.check(identifier, action);
      }

      // Avança o tempo em mais de 1 minuto
      currentTime += 61000;

      // Agora deve permitir novamente
      await expect(rateLimiter.check(identifier, action))
        .resolves
        .not.toThrow();
    } finally {
      Date.now = originalNow;
    }
  });
});
