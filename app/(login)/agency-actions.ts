'use server';

import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import {
  User,
  users,
  agencies,
  agencySettings,
  salesFunnels,
  salesFunnelStages,
  type NewUser,
  type NewAgency,
  type NewAgencySettings,
  ActivityType,
} from '@/lib/db/schema';
import { comparePasswords, hashPassword, setSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getUser, logActivity } from '@/lib/db/queries';

type ActionState = {
  error?: string;
  email?: string;
  password?: string;
  name?: string;
  agencyName?: string;
};

const signInSchema = z.object({
  email: z.string().email().min(3).max(255),
  password: z.string().min(8).max(100)
});

const signUpSchema = z.object({
  email: z.string().email().min(3).max(255),
  password: z.string().min(8).max(100),
  name: z.string().min(1).max(255),
  agencyName: z.string().min(1).max(255),
});

export async function signIn(state: ActionState, formData: FormData): Promise<ActionState> {
  const validatedFields = signInSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!validatedFields.success) {
    return { error: 'Invalid form data' };
  }

  const { email, password } = validatedFields.data;

  try {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (user.length === 0) {
      return { error: 'Invalid credentials' };
    }

    const foundUser = user[0];

    if (!foundUser.isActive) {
      return { error: 'Account is deactivated' };
    }

    const isPasswordValid = await comparePasswords(password, foundUser.password);

    if (!isPasswordValid) {
      return { error: 'Invalid credentials' };
    }

    // Check if agency is active
    const agency = await db
      .select()
      .from(agencies)
      .where(eq(agencies.id, foundUser.agencyId))
      .limit(1);

    if (agency.length === 0 || !agency[0].isActive) {
      return { error: 'Agency account is deactivated' };
    }

    await setSession(foundUser);
    await logActivity(foundUser.agencyId, foundUser.id, ActivityType.SIGN_IN);

    redirect('/');
  } catch (error) {
    console.error('Sign in error:', error);
    return { error: 'An error occurred during sign in' };
  }
}

export async function signUp(state: ActionState, formData: FormData): Promise<ActionState> {
  const validatedFields = signUpSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    name: formData.get('name'),
    agencyName: formData.get('agencyName'),
  });

  if (!validatedFields.success) {
    return { error: 'Invalid form data' };
  }

  const { email, password, name, agencyName } = validatedFields.data;

  try {
    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return { error: 'User with this email already exists' };
    }

    const hashedPassword = await hashPassword(password);

    // Create agency first
    const newAgency: NewAgency = {
      name: agencyName,
      email: email,
      country: 'Brasil',
      isActive: true,
    };

    const agency = await db.insert(agencies).values(newAgency).returning();
    const agencyId = agency[0].id;

    // Create agency settings
    const newAgencySettings: NewAgencySettings = {
      agencyId: agencyId,
      theme: 'light',
      emailNotifications: true,
      inAppNotifications: true,
    };

    await db.insert(agencySettings).values(newAgencySettings);

    // Create master user
    const newUser: NewUser = {
      email: email,
      password: hashedPassword,
      name: name,
      role: 'MASTER',
      agencyId: agencyId,
      isActive: true,
    };

    const createdUser = await db.insert(users).values(newUser).returning();

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

    await setSession(createdUser[0]);
    await logActivity(agencyId, createdUser[0].id, ActivityType.SIGN_UP);

    redirect('/');
  } catch (error) {
    console.error('Error during sign up:', error);
    return { error: 'Failed to create account' };
  }
}

export async function signOut() {
  const user = await getUser();
  if (user) {
    await logActivity(user.agencyId, user.id, ActivityType.SIGN_OUT);
  }
  
  (await cookies()).delete('session');
  redirect('/sign-in');
}

export async function updatePassword(formData: FormData) {
  const user = await getUser();
  if (!user) {
    throw new Error('User not found');
  }

  const currentPassword = formData.get('currentPassword') as string;
  const newPassword = formData.get('newPassword') as string;

  if (!currentPassword || !newPassword) {
    throw new Error('Both current and new password are required');
  }

  const isCurrentPasswordValid = await comparePasswords(currentPassword, user.password);
  if (!isCurrentPasswordValid) {
    throw new Error('Current password is incorrect');
  }

  const newPasswordHash = await hashPassword(newPassword);

  await db
    .update(users)
    .set({ password: newPasswordHash })
    .where(eq(users.id, user.id));

  await logActivity(user.agencyId, user.id, ActivityType.UPDATE_PASSWORD);
}

export async function updateAccount(formData: FormData) {
  const user = await getUser();
  if (!user) {
    throw new Error('User not found');
  }

  const name = formData.get('name') as string;
  const email = formData.get('email') as string;

  if (!name || !email) {
    throw new Error('Name and email are required');
  }

  // Check if email is already taken by another user
  if (email !== user.email) {
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      throw new Error('Email is already taken');
    }
  }

  await db
    .update(users)
    .set({ name, email })
    .where(eq(users.id, user.id));

  await logActivity(user.agencyId, user.id, ActivityType.UPDATE_ACCOUNT);
}
