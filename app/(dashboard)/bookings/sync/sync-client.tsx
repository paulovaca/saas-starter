"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { syncActiveProposals } from "@/lib/actions/bookings/sync-active-proposals";

interface SyncProposalsClientProps {
  unsyncedCount: number;
}

export function SyncProposalsClient({ unsyncedCount }: SyncProposalsClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    created?: number;
    skipped?: number;
    errors?: string[];
  } | null>(null);

  const handleSync = async () => {
    if (loading) return;
    
    setLoading(true);
    setResult(null);

    try {
      const syncResult = await syncActiveProposals();
      setResult(syncResult);
      
      // Se criou alguma reserva, recarregar a página após 2 segundos
      if (syncResult.created && syncResult.created > 0) {
        setTimeout(() => {
          router.refresh();
        }, 2000);
      }
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : "Erro ao sincronizar propostas"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {result && (
        <div style={{ 
          background: result.success ? "var(--success-bg, #d1fae5)" : "var(--error-bg, #fee2e2)",
          color: result.success ? "var(--success-fg, #065f46)" : "var(--error-fg, #991b1b)",
          padding: "1rem",
          borderRadius: "0.375rem",
          marginBottom: "1rem"
        }}>
          <p style={{ fontWeight: "500", marginBottom: "0.5rem" }}>{result.message}</p>
          
          {result.created !== undefined && result.skipped !== undefined && (
            <ul style={{ marginLeft: "1.5rem", fontSize: "0.875rem" }}>
              <li>Reservas criadas: {result.created}</li>
              <li>Propostas já sincronizadas: {result.skipped}</li>
            </ul>
          )}
          
          {result.errors && result.errors.length > 0 && (
            <div style={{ marginTop: "0.5rem", fontSize: "0.875rem" }}>
              <strong>Erros encontrados:</strong>
              <ul style={{ marginLeft: "1.5rem", marginTop: "0.25rem" }}>
                {result.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div style={{ display: "flex", gap: "1rem" }}>
        <button
          onClick={handleSync}
          disabled={loading || unsyncedCount === 0}
          style={{
            padding: "0.5rem 1.5rem",
            background: loading || unsyncedCount === 0 ? "var(--muted)" : "var(--primary)",
            color: loading || unsyncedCount === 0 ? "var(--muted-foreground)" : "var(--primary-foreground)",
            border: "none",
            borderRadius: "0.375rem",
            fontWeight: "500",
            cursor: loading || unsyncedCount === 0 ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? "Sincronizando..." : "Sincronizar Agora"}
        </button>

        <button
          onClick={() => router.push("/bookings")}
          style={{
            padding: "0.5rem 1.5rem",
            background: "var(--secondary)",
            color: "var(--secondary-foreground)",
            border: "1px solid var(--border)",
            borderRadius: "0.375rem",
            fontWeight: "500",
            cursor: "pointer"
          }}
        >
          Voltar para Reservas
        </button>
      </div>
    </div>
  );
}