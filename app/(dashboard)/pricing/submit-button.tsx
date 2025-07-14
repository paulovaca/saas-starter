'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useFormStatus } from 'react-dom';
import styles from './submit-button.module.css';

export function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      variant="outline"
      className={styles.button}
    >
      {pending ? (
        <>
          <Loader2 className={`${styles.icon} ${styles.iconLeft} ${styles.spinIcon}`} />
          Loading...
        </>
      ) : (
        <>
          Get Started
          <ArrowRight className={`${styles.icon} ${styles.iconRight}`} />
        </>
      )}
    </Button>
  );
}
