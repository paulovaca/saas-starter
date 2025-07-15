import { Metadata } from 'next/types';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth';
import { getBaseItemById } from '@/lib/actions/catalog';
import { BaseItemDetailContent } from '@/components/catalog/base-item-detail-content';

interface BaseItemDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: BaseItemDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const item = await getBaseItemById(id);
  
  return {
    title: item ? `${item.name} - Itens Base` : 'Item não encontrado',
    description: item?.description || 'Configurar campos do item base',
  };
}

export default async function BaseItemDetailPage({ params }: BaseItemDetailPageProps) {
  const { id } = await params;
  
  // Verificar autenticação e permissões
  const session = await auth();
  
  if (!session?.user) {
    redirect('/sign-in');
  }

  // Apenas Master e Admin podem acessar itens base
  if (!['MASTER', 'ADMIN'].includes(session.user.role)) {
    redirect('/dashboard');
  }

  // Buscar o item
  const item = await getBaseItemById(id);
  
  if (!item) {
    notFound();
  }

  return <BaseItemDetailContent item={item} />;
}
