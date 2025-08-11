import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { SyncProposalsClient } from "./sync-client";
import { checkUnsyncedProposals } from "@/lib/actions/bookings/sync-active-proposals";

export default async function SyncBookingsPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/login");
  }

  // Apenas ADMIN e MASTER podem sincronizar
  if (user.role !== "ADMIN" && user.role !== "MASTER" && user.role !== "DEVELOPER") {
    redirect("/bookings");
  }

  // Verificar quantas propostas precisam ser sincronizadas
  const checkResult = await checkUnsyncedProposals();

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "1rem" }}>
        Sincronizar Propostas com Reservas
      </h1>
      
      <div style={{ 
        background: "var(--card)", 
        padding: "1.5rem", 
        borderRadius: "0.5rem",
        border: "1px solid var(--border)"
      }}>
        <p style={{ marginBottom: "1rem", color: "var(--muted-foreground)" }}>
          Esta ferramenta cria reservas para propostas que já estão com status "Reserva Ativa" 
          mas ainda não possuem uma reserva correspondente no sistema.
        </p>

        {checkResult.count > 0 ? (
          <div style={{ 
            background: "var(--warning-bg, #fef3c7)", 
            color: "var(--warning-fg, #92400e)",
            padding: "1rem",
            borderRadius: "0.375rem",
            marginBottom: "1rem"
          }}>
            <strong>⚠️ Atenção:</strong> Existem {checkResult.count} proposta(s) com status 
            "Reserva Ativa" sem reserva criada:
            <ul style={{ marginTop: "0.5rem", marginLeft: "1.5rem" }}>
              {checkResult.proposals.map(p => (
                <li key={p.id}>{p.proposalNumber}</li>
              ))}
            </ul>
          </div>
        ) : (
          <div style={{ 
            background: "var(--success-bg, #d1fae5)", 
            color: "var(--success-fg, #065f46)",
            padding: "1rem",
            borderRadius: "0.375rem",
            marginBottom: "1rem"
          }}>
            ✅ Todas as propostas com status "Reserva Ativa" já possuem reservas criadas.
          </div>
        )}

        <SyncProposalsClient unsyncedCount={checkResult.count} />
      </div>
    </div>
  );
}