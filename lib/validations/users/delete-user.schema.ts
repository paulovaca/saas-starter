import { z } from 'zod';

export const deleteUserSchema = z.object({
  userId: z.string().uuid('ID do usuário inválido')
});

export type DeleteUserData = z.infer<typeof deleteUserSchema>;