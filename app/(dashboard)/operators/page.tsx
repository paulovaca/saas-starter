import { getOperators } from '@/lib/actions/operators/get-operators';
import { OperatorsPageContent } from '@/components/operators/operators-page-content';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Operadoras de Turismo',
  description: 'Gerencie suas operadoras de turismo parceiras',
};

interface OperatorsPageProps {
  searchParams: {
    search?: string;
    isActive?: string;
    hasProducts?: string;
    page?: string;
  };
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Operadoras de Turismo</h1>
          <p className="text-muted-foreground">
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
