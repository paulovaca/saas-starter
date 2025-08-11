'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { auth } from '@/lib/auth/auth';
import { updateUser } from '@/lib/db/queries/auth';
import { hashPassword, comparePasswords } from '@/lib/auth/session';

export async function handleChangeAvatar() {
  redirect('/profile?action=change-avatar');
}

export async function handleEditProfile() {
  redirect('/profile?action=edit-profile');
}

export async function handleChangePassword() {
  redirect('/profile?action=change-password');
}

// Schema para validação dos dados do perfil
const updateProfileSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
});

// Schema para validação de mudança de senha
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
  newPassword: z.string().min(8, 'Nova senha deve ter pelo menos 8 caracteres'),
  confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
});

export async function updateProfile(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: 'Usuário não autenticado' };
    }

    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string || undefined,
    };

    const result = updateProfileSchema.safeParse(data);
    if (!result.success) {
      return { error: result.error.errors[0]?.message || 'Dados inválidos' };
    }

    await updateUser(session.user.id, {
      name: result.data.name,
      email: result.data.email,
      phone: result.data.phone,
    });

    revalidatePath('/profile');
    return { success: 'Perfil atualizado com sucesso!' };
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    return { error: 'Erro interno do servidor' };
  }
}

export async function changePassword(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: 'Usuário não autenticado' };
    }

    const data = {
      currentPassword: formData.get('currentPassword') as string,
      newPassword: formData.get('newPassword') as string,
      confirmPassword: formData.get('confirmPassword') as string,
    };

    const result = changePasswordSchema.safeParse(data);
    if (!result.success) {
      return { error: result.error.errors[0]?.message || 'Dados inválidos' };
    }

    // Buscar usuário atual para verificar senha
    const { getUserById } = await import('@/lib/db/queries/auth');
    const userData = await getUserById(session.user.id);
    
    if (!userData?.user) {
      return { error: 'Usuário não encontrado' };
    }

    // Verificar senha atual
    const isCurrentPasswordValid = await comparePasswords(
      result.data.currentPassword,
      userData.user.password
    );

    if (!isCurrentPasswordValid) {
      return { error: 'Senha atual incorreta' };
    }

    // Hash da nova senha
    const hashedNewPassword = await hashPassword(result.data.newPassword);

    // Atualizar senha
    await updateUser(session.user.id, {
      password: hashedNewPassword,
    });

    revalidatePath('/profile');
    return { success: 'Senha alterada com sucesso!' };
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    return { error: 'Erro interno do servidor' };
  }
}

export async function updateAvatar(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: 'Usuário não autenticado' };
    }

    const avatarUrl = formData.get('avatarUrl') as string;
    
    if (!avatarUrl) {
      return { error: 'URL do avatar é obrigatória' };
    }

    // Validar se é uma URL válida
    try {
      new URL(avatarUrl);
    } catch {
      return { error: 'URL do avatar inválida' };
    }

    await updateUser(session.user.id, {
      avatar: avatarUrl,
    });

    revalidatePath('/profile');
    return { success: 'Avatar atualizado com sucesso!' };
  } catch (error) {
    console.error('Erro ao atualizar avatar:', error);
    return { error: 'Erro interno do servidor' };
  }
}
