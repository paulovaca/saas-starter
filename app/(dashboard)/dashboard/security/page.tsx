'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Lock, Trash2, Loader2 } from 'lucide-react';
import { useActionState } from 'react';
import { updatePassword, deleteAccount } from '@/app/(login)/actions';
import styles from './page.module.css';

type PasswordState = {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  error?: string;
  success?: string;
};

type DeleteState = {
  password?: string;
  error?: string;
  success?: string;
};

export default function SecurityPage() {
  const [passwordState, passwordAction, isPasswordPending] = useActionState<
    PasswordState,
    FormData
  >(updatePassword, {});

  const [deleteState, deleteAction, isDeletePending] = useActionState<
    DeleteState,
    FormData
  >(deleteAccount, {});

  return (
    <section className={styles.container}>
      <h1 className={styles.title}>
        Configurações de Segurança
      </h1>
      <Card className={styles.passwordCard}>
        <CardHeader>
          <CardTitle>Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form className={styles.form} action={passwordAction}>
            <div className={styles.fieldGroup}>
              <Label htmlFor="current-password" className={styles.label}>
                Current Password
              </Label>
              <Input
                id="current-password"
                name="currentPassword"
                type="password"
                autoComplete="current-password"
                required
                minLength={8}
                maxLength={100}
                defaultValue={passwordState.currentPassword}
              />
            </div>
            <div className={styles.fieldGroup}>
              <Label htmlFor="new-password" className={styles.label}>
                New Password
              </Label>
              <Input
                id="new-password"
                name="newPassword"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                maxLength={100}
                defaultValue={passwordState.newPassword}
              />
            </div>
            <div className={styles.fieldGroup}>
              <Label htmlFor="confirm-password" className={styles.label}>
                Confirm New Password
              </Label>
              <Input
                id="confirm-password"
                name="confirmPassword"
                type="password"
                required
                minLength={8}
                maxLength={100}
                defaultValue={passwordState.confirmPassword}
              />
            </div>
            {passwordState.error && (
              <p className={styles.errorMessage}>{passwordState.error}</p>
            )}
            {passwordState.success && (
              <p className={styles.successMessage}>{passwordState.success}</p>
            )}
            <Button
              type="submit"
              className={styles.updateButton}
              disabled={isPasswordPending}
            >
              {isPasswordPending ? (
                <>
                  <Loader2 className={`${styles.buttonIcon} ${styles.spinIcon}`} />
                  Updating...
                </>
              ) : (
                <>
                  <Lock className={styles.buttonIcon} />
                  Update Password
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Delete Account</CardTitle>
        </CardHeader>
        <CardContent>
          <p className={styles.deleteDescription}>
            A exclusão da conta é irreversível. Proceda com cautela.
          </p>
          <form action={deleteAction} className={styles.form}>
            <div className={styles.fieldGroup}>
              <Label htmlFor="delete-password" className={styles.label}>
                Confirm Password
              </Label>
              <Input
                id="delete-password"
                name="password"
                type="password"
                required
                minLength={8}
                maxLength={100}
                defaultValue={deleteState.password}
              />
            </div>
            {deleteState.error && (
              <p className={styles.errorMessage}>{deleteState.error}</p>
            )}
            <Button
              type="submit"
              variant="destructive"
              disabled={isDeletePending}
            >
              {isDeletePending ? (
                <>
                  <Loader2 className={`${styles.buttonIcon} ${styles.spinIcon}`} />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className={styles.buttonIcon} />
                  Delete Account
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
