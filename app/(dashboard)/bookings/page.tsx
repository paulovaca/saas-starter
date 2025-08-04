import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { BookingsList } from "@/components/bookings/bookings-list";
import { BookingFilters } from "@/components/bookings/booking-filters";
import { PageHeader } from "@/components/ui/page-header";
import "./bookings.css";

interface BookingsPageProps {
  searchParams: {
    status?: string;
    search?: string;
    page?: string;
    startDate?: string;
    endDate?: string;
  };
}

export default async function BookingsPage({ searchParams }: BookingsPageProps) {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="bookings-page">
      <PageHeader
        title="Reservas"
        description="Gerencie todas as reservas de viagens ativas"
      />
      
      <div className="bookings-content">
        <Suspense fallback={<div className="loading-filters">Carregando filtros...</div>}>
          <BookingFilters searchParams={searchParams} />
        </Suspense>
        
        <Suspense fallback={<div className="loading-list">Carregando reservas...</div>}>
          <BookingsList searchParams={searchParams} user={user} />
        </Suspense>
      </div>
    </div>
  );
}