'use client';

import useSWR from 'swr';
import type { User } from '@/lib/db/schema';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useAgency() {
  const { data: user } = useSWR<User>('/api/user', fetcher);
  const { data: agency } = useSWR(
    user?.agencyId ? `/api/agency/${user.agencyId}` : null,
    fetcher
  );

  return {
    agencyId: user?.agencyId || '',
    agencyName: agency?.name || '',
    agencyLogo: agency?.logo || '',
    agencySettings: agency?.settings || {},
    defaultFunnelId: agency?.defaultFunnelId || '',
    isLoading: !user || (user.agencyId && !agency),
  };
}
