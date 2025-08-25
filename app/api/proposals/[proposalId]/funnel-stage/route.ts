import { NextRequest, NextResponse } from 'next/server';
import { updateProposalFunnelStage } from '@/lib/actions/funnels/update-stage-manually';

// PATCH /api/proposals/[proposalId]/funnel-stage - Atualizar etapa do funil de uma proposta manualmente
export async function PATCH(
  request: NextRequest,
  { params }: { params: { proposalId: string } }
) {
  try {
    const { proposalId } = params;
    const body = await request.json();
    
    const result = await updateProposalFunnelStage({
      proposalId,
      newFunnelStageId: body.newFunnelStageId,
      reason: body.reason,
    });

    if (result.success) {
      return NextResponse.json(result, { status: 200 });
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error('Error updating proposal funnel stage:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor' 
      },
      { status: 500 }
    );
  }
}