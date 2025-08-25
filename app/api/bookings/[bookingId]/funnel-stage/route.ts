import { NextRequest, NextResponse } from 'next/server';
import { updateBookingFunnelStage } from '@/lib/actions/funnels/update-stage-manually';

// PATCH /api/bookings/[bookingId]/funnel-stage - Atualizar etapa do funil de uma reserva manualmente
export async function PATCH(
  request: NextRequest,
  { params }: { params: { bookingId: string } }
) {
  try {
    const { bookingId } = params;
    const body = await request.json();
    
    const result = await updateBookingFunnelStage({
      bookingId,
      newFunnelStageId: body.newFunnelStageId,
      reason: body.reason,
    });

    if (result.success) {
      return NextResponse.json(result, { status: 200 });
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error('Error updating booking funnel stage:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor' 
      },
      { status: 500 }
    );
  }
}