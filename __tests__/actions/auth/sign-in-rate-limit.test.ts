import { signIn } from '../../../lib/actions/auth/sign-in';
import { rateLimiter } from '@/lib/services/rate-limiter';

// Mock das dependências
jest.mock('@/lib/db/drizzle', () => ({
  db: {
    select: jest.fn(() => ({
      from: jest.fn(() => ({
        where: jest.fn(() => ({
          limit: jest.fn(() => Promise.resolve([]))
        }))
      }))
    }))
  }
}));

jest.mock('@/lib/auth/session', () => ({
  hashPassword: jest.fn().mockResolvedValue('hashed-password'),
  verifyPassword: jest.fn().mockResolvedValue(false), // Para simular falha de login
  createSession: jest.fn().mockResolvedValue('session-token'),
}));

jest.mock('@/lib/services/activity-logger', () => ({
  logActivity: jest.fn()
}));

jest.mock('@upstash/ratelimit', () => ({}));
jest.mock('@upstash/redis', () => ({}));

// Mock da biblioteca jose (JWT)
jest.mock('jose', () => ({
  SignJWT: jest.fn().mockImplementation(() => ({
    setProtectedHeader: jest.fn().mockReturnThis(),
    setIssuedAt: jest.fn().mockReturnThis(),
    setExpirationTime: jest.fn().mockReturnThis(),
    sign: jest.fn().mockResolvedValue('mock-jwt-token'),
  })),
  jwtVerify: jest.fn().mockResolvedValue({
    payload: { sub: 'user-id', exp: Date.now() / 1000 + 3600 }
  }),
}));

// Mock do bcryptjs
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
  compare: jest.fn().mockResolvedValue(false), // Para simular falha de autenticação
}));

// Mock do next/headers
const mockHeaders = {
  get: jest.fn(() => '192.168.1.1')
};
jest.mock('next/headers', () => ({
  headers: jest.fn(() => Promise.resolve(mockHeaders))
}));

// Mock do redirect do Next.js
jest.mock('next/navigation', () => ({
  redirect: jest.fn()
}));

describe('SignIn Rate Limiting', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Limpa o cache do rate limiter antes de cada teste
    rateLimiter.clearMemoryCache();
  });

  test('deve aplicar rate limiting ao tentar fazer login múltiplas vezes', async () => {
    // Simula tentativas rápidas de login
    const formData = new FormData();
    formData.append('email', 'test@example.com');
    formData.append('password', 'wrongpassword');

    // O rate limiter está configurado para permitir 5 tentativas em 10 minutos,
    // então na 6ª tentativa deve bloquear
    let rateLimitTriggered = false;

    for (let i = 0; i < 7; i++) {
      const result = await signIn({}, formData);
      
      console.log(`Attempt ${i + 1}:`, result);
      
      // O FormAction retorna o erro diretamente nas propriedades do objeto
      if (result && typeof result === 'object') {
        const resultObj = result as any;
        
        // Verifica se tem mensagem de rate limit na propriedade 'error' ou 'message'
        const errorMessage = resultObj.error || resultObj.message || '';
        const errorCode = resultObj.code;
        
        console.log(`Checking error for attempt ${i + 1}:`, {
          errorMessage,
          code: errorCode,
          includes: typeof errorMessage === 'string' && errorMessage.includes('Muitas tentativas'),
          isRateLimit: errorCode === 'RATE_LIMIT_ERROR'
        });
        
        if (typeof errorMessage === 'string' && errorMessage.includes('Muitas tentativas')) {
          rateLimitTriggered = true;
          console.log(`Rate limit triggered at attempt ${i + 1}`);
          break;
        }
        
        // Também verifica se o código é RATE_LIMIT_ERROR
        if (errorCode === 'RATE_LIMIT_ERROR') {
          rateLimitTriggered = true;
          console.log(`Rate limit triggered at attempt ${i + 1} (by code)`);
          break;
        }
      }
    }

    // Verifica se o rate limiting foi ativado em algum ponto
    expect(rateLimitTriggered).toBe(true);
  });

  test('deve permitir login normal quando dentro do limite', async () => {
    const formData = new FormData();
    formData.append('email', 'test@example.com');
    formData.append('password', 'password123');

    // Uma tentativa deve passar pelo rate limiting
    const result = await signIn({}, formData);
    
    // Pode falhar por outros motivos (usuário não existe, etc.)
    // mas não deve falhar por rate limiting
    if (result && typeof result === 'object' && 'error' in result) {
      const errorResult = result as any;
      expect(errorResult.error).not.toContain('Muitas tentativas');
    }
  });
});
