import { getOperators } from '@/lib/actions/operators/get-operators';
import { OperatorsPageContent } from '@/components/operators/operators-page-content';
import { Metadata } from 'next';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Operadoras de Turismo',
  description: 'Gerencie suas operadoras de turismo parceiras',
};

interface OperatorsPageProps {
  searchParams: Promise<{
    search?: string;
    isActive?: string;
    hasProducts?: string;
    page?: string;
  }>;
}

export default async function OperatorsPage({ searchParams }: OperatorsPageProps) {
  const params = await searchParams;
  const filters = {
    search: params.search,
    isActive: params.isActive === 'true' ? true : params.isActive === 'false' ? false : undefined,
    hasProducts: params.hasProducts === 'true' ? true : params.hasProducts === 'false' ? false : undefined,
    page: parseInt(params.page || '1'),
  };

  const { data: operators, pagination } = await getOperators(filters);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1>Operadoras de Turismo</h1>
          <p className={styles.headerDescription}>
            Gerencie suas operadoras de turismo parceiras e seus produtos/serviços
          </p>
        </div>
      </div>

      <OperatorsPageContent 
        operators={operators}
        pagination={pagination}
        filters={filters}
      />
    </div>
  );
}
