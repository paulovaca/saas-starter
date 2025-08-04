"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BOOKING_STATUS, BOOKING_STATUS_LABELS } from "@/lib/types/booking-status";
import "./booking-filters.css";

interface BookingFiltersProps {
  searchParams: {
    status?: string;
    search?: string;
    page?: string;
    startDate?: string;
    endDate?: string;
  };
}

export function BookingFilters({ searchParams }: BookingFiltersProps) {
  const router = useRouter();
  const urlSearchParams = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(urlSearchParams);
    
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    
    // Reset page when filtering
    params.delete("page");
    
    router.push(`/bookings?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push("/bookings");
  };

  const hasActiveFilters = Boolean(
    searchParams.status || 
    searchParams.search || 
    searchParams.startDate || 
    searchParams.endDate
  );

  return (
    <div className="booking-filters">
      <div className="filters-header">
        <h3 className="filters-title">Filtros</h3>
        <div className="filters-actions">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="filters-clear"
            >
              Limpar Filtros
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="filters-toggle"
          >
            {showFilters ? "Ocultar" : "Mostrar"} Filtros
          </button>
        </div>
      </div>
      
      {showFilters && (
        <div className="filters-grid">
          <div className="filter-group">
            <label className="filter-label">Busca</label>
            <input
              type="text"
              placeholder="Número da reserva, cliente..."
              className="filter-input"
              defaultValue={searchParams.search || ""}
              onChange={(e) => updateFilter("search", e.target.value)}
            />
          </div>
          
          <div className="filter-group">
            <label className="filter-label">Status</label>
            <select
              className="filter-select"
              defaultValue={searchParams.status || ""}
              onChange={(e) => updateFilter("status", e.target.value)}
            >
              <option value="">Todos os status</option>
              {Object.entries(BOOKING_STATUS_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label className="filter-label">Data Início</label>
            <input
              type="date"
              className="filter-input"
              defaultValue={searchParams.startDate || ""}
              onChange={(e) => updateFilter("startDate", e.target.value)}
            />
          </div>
          
          <div className="filter-group">
            <label className="filter-label">Data Fim</label>
            <input
              type="date"
              className="filter-input"
              defaultValue={searchParams.endDate || ""}
              onChange={(e) => updateFilter("endDate", e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  );
}