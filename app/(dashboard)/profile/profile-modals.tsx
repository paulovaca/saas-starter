'use client';

import { ChangeAvatarModal } from './change-avatar-modal';
import { EditProfileModal } from './edit-profile-modal';
import { ChangePasswordModal } from './change-password-modal';

interface ProfileModalsProps {
  currentAction?: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
    phone?: string | null;
  };
}

export function ProfileModals({ currentAction, user }: ProfileModalsProps) {
  if (!currentAction) return null;

  return (
    <>
      {currentAction === 'change-avatar' && <ChangeAvatarModal user={user} />}
      {currentAction === 'edit-profile' && <EditProfileModal user={user} />}
      {currentAction === 'change-password' && <ChangePasswordModal user={user} />}
    </>
  );
}
