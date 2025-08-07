import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { BookingsList } from "@/components/bookings/bookings-list";
import { BookingFilters } from "@/components/bookings/booking-filters";
import { PageHeader } from "@/components/ui/page-header";
import styles from "./bookings.module.css";

// Force dynamic rendering as this page uses authentication
export const dynamic = 'force-dynamic';

interface BookingsPageProps {
  searchParams: Promise<{
    status?: string;
    search?: string;
    page?: string;
    startDate?: string;
    endDate?: string;
  }>;
}

export default async function BookingsPage({ searchParams }: BookingsPageProps) {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/login");
  }

  const params = await searchParams;

  return (
    <div className={styles.bookingsPage}>
      <PageHeader
        title="Reservas"
        description="Gerencie todas as reservas de viagens ativas"
      />
      
      <div className={styles.bookingsContent}>
        <Suspense fallback={<div className={styles.loadingFilters}>Carregando filtros...</div>}>
          <BookingFilters searchParams={params} />
        </Suspense>
        
        <Suspense fallback={<div className={styles.loadingList}>Carregando reservas...</div>}>
          <BookingsList searchParams={params} user={user} />
        </Suspense>
      </div>
    </div>
  );
}