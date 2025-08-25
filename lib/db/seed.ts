import { eq } from 'drizzle-orm';
import { stripe } from '../payments/stripe';
import { db } from './drizzle';
import { users, agencies, agencySettings } from './schema';
import { salesFunnels, salesFunnelStages } from './schema/funnels';
import { hashPassword } from '@/lib/auth/session';

async function createStripeProducts() {
  console.log('Creating Stripe products and prices...');

  const baseProduct = await stripe.products.create({
    name: 'Base',
    description: 'Base subscription plan',
  });

  await stripe.prices.create({
    product: baseProduct.id,
    unit_amount: 800, // $8 in cents
    currency: 'usd',
    recurring: {
      interval: 'month',
      trial_period_days: 7,
    },
  });

  const plusProduct = await stripe.products.create({
    name: 'Plus',
    description: 'Plus subscription plan',
  });

  await stripe.prices.create({
    product: plusProduct.id,
    unit_amount: 1200, // $12 in cents
    currency: 'usd',
    recurring: {
      interval: 'month',
      trial_period_days: 7,
    },
  });

  console.log('Stripe products and prices created successfully.');
}

async function seed() {
  console.log('🌱 Seeding database...');

  try {
    console.log('Creating first agency...');
    
    // Create the first agency
    const agency = await db.insert(agencies).values({
      name: 'Demo Travel Agency',
      email: 'admin@demoagency.com', 
      country: 'Brasil',
      isActive: true,
    }).returning();

    const agencyId = agency[0].id;
    console.log(`✅ Agency created with ID: ${agencyId}`);

    // Create agency settings
    await db.insert(agencySettings).values({
      agencyId: agencyId,
      theme: 'light',
      emailNotifications: true,
      inAppNotifications: true,
    });

    console.log('✅ Agency settings created');

    // Create the master user
    const hashedPassword = await hashPassword('admin123');
    const masterUser = await db.insert(users).values({
      email: 'admin@demoagency.com',
      password: hashedPassword,
      name: 'Administrador',
      role: 'MASTER',
      agencyId: agencyId,
      isActive: true,
    }).returning();

    console.log(`✅ Master user created with ID: ${masterUser[0].id}`);

    // Create default sales funnel
    const defaultFunnel = await db.insert(salesFunnels).values({
      name: 'Funil Padrão',
      isDefault: true,
      agencyId: agencyId,
      createdBy: masterUser[0].id,
    }).returning();

    const funnelId = defaultFunnel[0].id;
    console.log(`✅ Default funnel created with ID: ${funnelId}`);

    // Create sales funnel stages
    const stages = [
      { name: 'Novo Lead', guidelines: 'Cliente acabou de entrar em contato', order: 1 },
      { name: 'Qualificado', guidelines: 'Cliente demonstrou interesse real', order: 2 },
      { name: 'Proposta Enviada', guidelines: 'Proposta foi enviada para o cliente', order: 3 },
      { name: 'Negociação', guidelines: 'Cliente está negociando valores/condições', order: 4 },
      { name: 'Fechado', guidelines: 'Venda foi concluída com sucesso', order: 5 },
    ];

    for (const stage of stages) {
      await db.insert(salesFunnelStages).values({
        ...stage,
        funnelId: funnelId,
        createdBy: masterUser[0].id,
      });
    }

    console.log('✅ Sales funnel stages created');

    // Update agency settings to point to default funnel
    await db.update(agencySettings)
      .set({ defaultFunnelId: funnelId })
      .where(eq(agencySettings.agencyId, agencyId));

    console.log('✅ Agency settings updated with default funnel');

    // Create Stripe products
    await createStripeProducts();

    console.log('🎉 Seeding completed successfully!');
    console.log('');
    console.log('Login credentials:');
    console.log('Email: admin@demoagency.com');
    console.log('Password: admin123');
    
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

seed()
  .catch((error) => {
    console.error('Seed process failed:', error);
    process.exit(1);
  })
  .finally(() => {
    console.log('Seed process finished. Exiting...');
    process.exit(0);
  });
