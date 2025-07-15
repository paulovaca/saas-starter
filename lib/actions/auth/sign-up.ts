'use server';

import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { users, agencies, agencySettings } from '@/lib/db/schema';
import { salesFunnels, salesFunnelStages } from '@/lib/db/schema/funnels';
import { hashPassword, setSession } from '@/lib/auth/session';
import { withFormAction } from '@/lib/services/error-handler/action-wrapper';
import { signUpSchema } from '@/lib/validations/auth.schema';
import { ActivityLogger } from '@/lib/services/activity-logger';
import { ConflictError } from '@/lib/services/error-handler';

export const signUp = withFormAction(
  async (context, data: FormData | any) => {
    // Extract form data - handle both FormData and object
    const email = data instanceof FormData ? data.get('email') as string : data.email;
    const password = data instanceof FormData ? data.get('password') as string : data.password;
    const name = data instanceof FormData ? data.get('name') as string : data.name;
    const agencyName = data instanceof FormData ? data.get('agencyName') as string : data.agencyName;

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      throw new ConflictError('User with this email already exists');
    }

    const hashedPassword = await hashPassword(password);

    // Create agency first
    const agency = await db.insert(agencies).values({
      name: agencyName,
      email: email,
      country: 'Brasil',
      isActive: true,
    }).returning();

    const agencyId = agency[0].id;

    // Create agency settings
    await db.insert(agencySettings).values({
      agencyId: agencyId,
      theme: 'light',
      emailNotifications: true,
      inAppNotifications: true,
    });

    // Create master user
    const createdUser = await db.insert(users).values({
      email: email,
      password: hashedPassword,
      name: name,
      role: 'MASTER',
      agencyId: agencyId,
      isActive: true,
    }).returning();

    // Create default sales funnel
    const defaultFunnel = await db.insert(salesFunnels).values({
      name: 'Funil Padrão',
      isDefault: true,
      agencyId: agencyId,
      createdBy: createdUser[0].id,
    }).returning();

    const funnelId = defaultFunnel[0].id;

    // Create sales funnel stages
    const stages = [
      { name: 'Novo Lead', instructions: 'Cliente acabou de entrar em contato', order: 1 },
      { name: 'Qualificado', instructions: 'Cliente demonstrou interesse real', order: 2 },
      { name: 'Proposta Enviada', instructions: 'Proposta foi enviada para o cliente', order: 3 },
      { name: 'Negociação', instructions: 'Cliente está negociando valores/condições', order: 4 },
      { name: 'Fechado', instructions: 'Venda foi concluída com sucesso', order: 5 },
    ];

    for (const stage of stages) {
      await db.insert(salesFunnelStages).values({
        ...stage,
        funnelId: funnelId,
        createdBy: createdUser[0].id,
      });
    }

    // Update agency settings to point to default funnel
    await db.update(agencySettings)
      .set({ defaultFunnelId: funnelId })
      .where(eq(agencySettings.agencyId, agencyId));

    // Set session
    await setSession(createdUser[0]);

    // Log activities
    await ActivityLogger.logAgencyActivity(
      agencyId,
      createdUser[0].id,
      'CREATE_AGENCY'
    );

    await ActivityLogger.logAuth(
      agencyId,
      createdUser[0].id,
      'SIGN_UP'
    );

    redirect('/');
  },
  {
    schema: signUpSchema,
    requireAuth: false,
    activityType: 'SIGN_UP' as any,
    rateLimit: {
      action: 'sign-up',
      limit: 3,        // 3 tentativas de registro
      window: '15m'    // em 15 minutos
    }
  }
);
