import { db } from "@/lib/db/drizzle";
import { bookingTimeline } from "@/lib/db/schema/bookings";
import { users } from "@/lib/db/schema/users";
import { eq, desc } from "drizzle-orm";
import type { TimelineEvent } from "@/lib/types/booking-status";

interface TimelineEventData {
  id: string;
  eventType: TimelineEvent;
  description: string;
  metadata: any;
  createdAt: Date;
  userName: string | null;
}

export async function getBookingTimeline(bookingId: string): Promise<TimelineEventData[]> {
  try {
    const timeline = await db
      .select({
        id: bookingTimeline.id,
        eventType: bookingTimeline.eventType,
        description: bookingTimeline.description,
        metadata: bookingTimeline.metadata,
        createdAt: bookingTimeline.createdAt,
        userName: users.name
      })
      .from(bookingTimeline)
      .leftJoin(users, eq(bookingTimeline.userId, users.id))
      .where(eq(bookingTimeline.bookingId, bookingId))
      .orderBy(desc(bookingTimeline.createdAt));

    return timeline;
  } catch (error) {
    console.error("Erro ao buscar timeline da reserva:", error);
    throw new Error("Falha ao carregar timeline");
  }
}