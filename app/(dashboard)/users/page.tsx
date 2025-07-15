import { Suspense } from 'react';
import Link from 'next/link';
import { Plus, Users } from 'lucide-react';
import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { getUsersWithPagination } from '@/lib/actions/users/get-users';
import { Button } from '@/components/ui/button';
import { UserTable } from '@/components/users/user-table';
import { UserFormModal } from '@/components/users/user-form-modal';
import { UserFilters } from '@/components/users/user-filters';
import styles from './users.module.css';

type PageProps = {
  searchParams: Promise<{
    page?: string;
    search?: string;
    role?: string;
    status?: string;
  }>;
};

export default async function UsersPage({ searchParams }: PageProps) {
  const session = await auth();
  
  if (!session || !['MASTER', 'ADMIN'].includes(session.user.role)) {
    redirect('/');
  }

  const params = await searchParams;
  const page = Number(params.page) || 1;
  const search = params.search || '';
  const role = params.role || undefined;
  const status = params.status || undefined;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerInfo}>
            <div className={styles.iconContainer}>
              <Users className={styles.icon} />
            </div>
            <div>
              <h1 className={styles.title}>Gestão de Usuários</h1>
              <p className={styles.description}>
                Gerencie usuários da sua agência, defina permissões e controle acessos
              </p>
            </div>
          </div>
          
          {['DEVELOPER', 'MASTER', 'ADMIN'].includes(session.user.role) && (
            <UserFormModal currentUserRole={session.user.role}>
              <Button className={styles.addButton}>
                <Plus className={styles.buttonIcon} />
                Adicionar Usuário
              </Button>
            </UserFormModal>
          )}
        </div>
      </div>

      <div className={styles.content}>
        <UserFilters
          defaultSearch={search}
          defaultRole={role || ''}
          defaultStatus={status || ''}
        />

        <div className={styles.tableContainer}>
          <Suspense fallback={<UserTableSkeleton />}>
            <UserTableWrapper 
              page={page}
              search={search}
              role={role}
              status={status}
              currentUserRole={session.user.role}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

async function UserTableWrapper({ 
  page, 
  search, 
  role, 
  status,
  currentUserRole
}: {
  page: number;
  search: string;
  role: string | undefined;
  status: string | undefined;
  currentUserRole: 'DEVELOPER' | 'MASTER' | 'ADMIN' | 'AGENT';
}) {
  const result = await getUsersWithPagination({
    page,
    search,
    role: role as any,
    isActive: status === 'active' ? true : status === 'inactive' ? false : undefined,
    limit: 10,
  });

  if (result.error) {
    return (
      <div className={styles.error}>
        <p>Erro ao carregar usuários: {result.error}</p>
      </div>
    );
  }

  return (
    <UserTable 
      users={result.users || []}
      pagination={result.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 }}
      currentPage={page}
      currentUserRole={currentUserRole}
    />
  );
}

function UserTableSkeleton() {
  return (
    <div className={styles.skeleton}>
      <div className={styles.skeletonHeader} />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className={styles.skeletonRow} />
      ))}
    </div>
  );
}
