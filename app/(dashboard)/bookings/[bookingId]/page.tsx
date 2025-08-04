import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getBookingDetails } from "@/lib/actions/bookings/get-booking-details";
import { BookingHeader } from "@/components/bookings/booking-header";
import { BookingTimeline } from "@/components/bookings/booking-timeline";
import { BookingDocuments } from "@/components/bookings/documents/booking-documents";
import { BookingStatusChanger } from "@/components/bookings/status/booking-status-changer";
import { BookingNotes } from "@/components/bookings/booking-notes";
import "./booking-details.css";

interface BookingDetailsPageProps {
  params: {
    bookingId: string;
  };
}

export default async function BookingDetailsPage({ params }: BookingDetailsPageProps) {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/login");
  }

  try {
    const booking = await getBookingDetails(params.bookingId, user.agencyId, user.id);
    
    if (!booking) {
      notFound();
    }

    return (
      <div className="booking-details-page">
        <Suspense fallback={<div className="loading-header">Carregando...</div>}>
          <BookingHeader booking={booking} user={user} />
        </Suspense>

        <div className="booking-details-content">
          <div className="booking-main-column">
            <Suspense fallback={<div className="loading-section">Carregando timeline...</div>}>
              <BookingTimeline bookingId={params.bookingId} />
            </Suspense>

            <Suspense fallback={<div className="loading-section">Carregando documentos...</div>}>
              <BookingDocuments bookingId={params.bookingId} user={user} />
            </Suspense>
          </div>

          <div className="booking-sidebar">
            <Suspense fallback={<div className="loading-section">Carregando status...</div>}>
              <BookingStatusChanger booking={booking} user={user} />
            </Suspense>

            <Suspense fallback={<div className="loading-section">Carregando anotações...</div>}>
              <BookingNotes bookingId={params.bookingId} user={user} />
            </Suspense>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Erro ao carregar detalhes da reserva:", error);
    notFound();
  }
}