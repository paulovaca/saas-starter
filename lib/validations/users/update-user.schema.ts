import { z } from 'zod';
import { updateUserSchema } from './user.schema';

// Schema for update user action that includes userId
export const updateUserActionSchema = updateUserSchema.extend({
  userId: z.string().uuid('ID do usuário inválido')
});

export type UpdateUserActionData = z.infer<typeof updateUserActionSchema>;