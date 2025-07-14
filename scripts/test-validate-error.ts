import { config } from 'dotenv';
import { z } from 'zod';
import chalk from 'chalk';

// Carrega .env com configuração inválida para teste
config({ path: '.env.test' });

// Define o que é obrigatório
const envSchema = z.object({
  // Banco de dados
  DATABASE_URL: z.string().url().refine(
    (url) => url.startsWith('postgres://') || url.startsWith('postgresql://'),
    'DATABASE_URL deve ser uma URL PostgreSQL válida'
  ),

  // Autenticação
  AUTH_SECRET: z.string().min(32, 'AUTH_SECRET deve ter pelo menos 32 caracteres'),

  // URLs
  NEXT_PUBLIC_APP_URL: z.string().url('NEXT_PUBLIC_APP_URL deve ser uma URL válida'),

  // Stripe (opcional em dev)
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  // Redis (opcional)
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
});

// Função principal
async function validateEnvironment() {
  console.log(chalk.blue('🔍 Validando variáveis de ambiente...\n'));

  try {
    // Valida
    const env = envSchema.parse(process.env);

    // Mostra resumo
    console.log(chalk.green('✅ Variáveis obrigatórias:'));
    console.log(`   - DATABASE_URL: ${chalk.gray('Configurado')}`);
    console.log(`   - AUTH_SECRET: ${chalk.gray('Configurado')}`);
    console.log(`   - NEXT_PUBLIC_APP_URL: ${chalk.gray(env.NEXT_PUBLIC_APP_URL)}`);

    console.log('\n' + chalk.yellow('📦 Variáveis opcionais:'));
    
    // Stripe
    if (env.STRIPE_SECRET_KEY) {
      console.log(`   - Stripe: ${chalk.green('Configurado')}`);
    } else {
      console.log(`   - Stripe: ${chalk.gray('Não configurado (pagamentos desabilitados)')}`);
    }

    // Redis
    if (env.UPSTASH_REDIS_REST_URL) {
      console.log(`   - Redis: ${chalk.green('Configurado')}`);
    } else {
      console.log(`   - Redis: ${chalk.gray('Não configurado (usando cache em memória)')}`);
    }

    console.log('\n' + chalk.green.bold('✨ Ambiente validado com sucesso!'));
    process.exit(0);

  } catch (error) {
    console.log(chalk.red.bold('\n❌ Erro na validação:\n'));

    if (error instanceof z.ZodError) {
      // Mostra erros de validação
      error.errors.forEach((err) => {
        console.log(chalk.red(`   - ${err.path.join('.')}: ${err.message}`));
      });

      console.log('\n' + chalk.yellow('💡 Dica: Copie .env.example para .env e preencha os valores'));
    } else {
      // Outros erros
      console.log(chalk.red(error instanceof Error ? error.message : 'Erro desconhecido'));
    }

    process.exit(1);
  }
}

// Executa
validateEnvironment().catch((error) => {
  console.error(chalk.red('Erro fatal na validação:'), error);
  process.exit(1);
});
