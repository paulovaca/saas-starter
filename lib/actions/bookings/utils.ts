import { db } from "@/lib/db/drizzle";
import { bookings } from "@/lib/db/schema/bookings";
import { eq, and, sql } from "drizzle-orm";

/**
 * Gerar número único de reserva no formato: RES-YYYY-MM-XXXXX
 */
export async function generateBookingNumber(agencyId: string): Promise<string> {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const prefix = `RES-${year}-${month}-`;

  // Buscar o último número de reserva do mês atual para a agência
  const lastBooking = await db
    .select({ bookingNumber: bookings.bookingNumber })
    .from(bookings)
    .where(
      and(
        eq(bookings.agencyId, agencyId),
        sql`${bookings.bookingNumber} LIKE ${prefix + '%'}`
      )
    )
    .orderBy(sql`${bookings.bookingNumber} DESC`)
    .limit(1);

  let nextNumber = 1;
  
  if (lastBooking && lastBooking.length > 0) {
    const lastNumber = lastBooking[0].bookingNumber;
    const match = lastNumber.match(/RES-\d{4}-\d{2}-(\d+)/);
    if (match) {
      nextNumber = parseInt(match[1]) + 1;
    }
  }

  return `${prefix}${String(nextNumber).padStart(5, '0')}`;
}

/**
 * Formatar data para exibição
 */
export function formatDate(date: Date | string | null): string {
  if (!date) return "-";
  
  const dateObj = typeof date === "string" ? new Date(date) : date;
  
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(dateObj);
}

/**
 * Formatar data sem hora
 */
export function formatDateOnly(date: Date | string | null): string {
  if (!date) return "-";
  
  const dateObj = typeof date === "string" ? new Date(date) : date;
  
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(dateObj);
}

/**
 * Calcular dias desde uma data
 */
export function daysSince(date: Date | string): number {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - dateObj.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}