import { testBookingCreation } from "@/lib/actions/bookings/test-booking-creation";
import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import Link from "next/link";

// Force dynamic rendering as this page uses authentication
export const dynamic = 'force-dynamic';

export default async function TestBookingsPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/login");
  }

  // Só permite master/admin executar o teste
  if (!["MASTER", "ADMIN"].includes(user.role)) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h1>Acesso Negado</h1>
        <p>Apenas administradores podem executar testes.</p>
        <Link href="/bookings">Ir para Reservas</Link>
      </div>
    );
  }

  const result = await testBookingCreation();

  return (
    <div style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>
      <h1>Teste de Criação de Reservas</h1>
      
      <div style={{ 
        padding: "1rem", 
        borderRadius: "8px", 
        border: "1px solid #ddd",
        backgroundColor: result.success ? "#f0f9ff" : "#fef2f2",
        marginBottom: "2rem"
      }}>
        {result.success ? (
          <div>
            <h3 style={{ color: "#059669", margin: "0 0 1rem 0" }}>✅ Teste Concluído com Sucesso!</h3>
            <p><strong>ID da Reserva:</strong> {result.bookingId}</p>
            <p><strong>Proposta Origem:</strong> {result.proposalNumber}</p>
          </div>
        ) : (
          <div>
            <h3 style={{ color: "#dc2626", margin: "0 0 1rem 0" }}>❌ Teste Falhado</h3>
            <p><strong>Erro:</strong> {result.error}</p>
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: "1rem" }}>
        <Link 
          href="/bookings" 
          style={{ 
            padding: "0.75rem 1.5rem", 
            backgroundColor: "#3b82f6", 
            color: "white", 
            textDecoration: "none", 
            borderRadius: "6px",
            display: "inline-block"
          }}
        >
          Ver Reservas
        </Link>
        
        <Link 
          href="/proposals" 
          style={{ 
            padding: "0.75rem 1.5rem", 
            backgroundColor: "#6b7280", 
            color: "white", 
            textDecoration: "none", 
            borderRadius: "6px",
            display: "inline-block"
          }}
        >
          Ver Propostas
        </Link>
      </div>

      <div style={{ marginTop: "2rem", padding: "1rem", backgroundColor: "#f9fafb", borderRadius: "6px" }}>
        <h4>🎯 Fluxo Automático Implementado:</h4>
        <ol>
          <li><strong>Proposta aceita</strong> → Status muda para "ACTIVE_BOOKING" (Negócio/Viagem Ativo)</li>
          <li><strong>AUTOMÁTICO:</strong> Sistema cria reserva automaticamente</li>
          <li><strong>Reserva criada</strong> com status "pending_documents"</li>
          <li><strong>Gestão:</strong> Use a página de Reservas para gerenciar o processo</li>
        </ol>
        
        <h4>🧪 Teste Manual:</h4>
        <p>Esta página tenta encontrar uma proposta com status "ACTIVE_BOOKING" e criar uma reserva manualmente para demonstração.</p>
      </div>
    </div>
  );
}