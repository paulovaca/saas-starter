import Link from 'next/link';
import { CircleIcon } from 'lucide-react';
import MainLayout from '@/components/layout/main-layout';
import styles from './not-found.module.css';

export default function NotFound() {
  return (
    <MainLayout>
      <div className={styles.notFoundContainer}>
        <div className={styles.notFoundContent}>
          <div className={styles.logoContainer}>
            <CircleIcon className={styles.logo} />
          </div>
          <h1 className={styles.title}>
            Página Não Encontrada
          </h1>
          <p className={styles.description}>
            A página que você está procurando pode ter sido removida, teve seu nome
            alterado ou está temporariamente indisponível.
          </p>
          <Link
            href="/"
            className={styles.homeButton}
          >
            Voltar ao Dashboard
          </Link>
        </div>
      </div>
    </MainLayout>
  );
}
