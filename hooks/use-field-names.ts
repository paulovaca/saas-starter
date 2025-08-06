'use client';

import { useState, useEffect, useMemo } from 'react';
import { getFieldNames } from '@/lib/actions/base-items/get-field-names';

interface FieldInfo {
  name: string;
  type: string;
  createdAt?: Date;
}

interface UseFieldNamesResult {
  getFieldName: (fieldId: string) => string;
  getFieldInfo: (fieldId: string) => FieldInfo | null;
  loading: boolean;
  error: string | null;
}

// Cache global para evitar múltiplas requisições dos mesmos campos
const fieldNamesCache: Record<string, FieldInfo> = {};
const pendingRequests: Record<string, Promise<void>> = {};

export function useFieldNames(customFields: Record<string, any> | null | undefined): UseFieldNamesResult {
  const [fieldNames, setFieldNames] = useState<Record<string, FieldInfo>>(fieldNamesCache);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Extract field IDs that look like UUIDs
  const fieldIds = useMemo(() => {
    if (!customFields) return [];
    
    return Object.keys(customFields).filter(key => {
      // Check if the key looks like a UUID (basic pattern check)
      return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(key);
    });
  }, [customFields]);

  useEffect(() => {
    if (fieldIds.length === 0) {
      return;
    }

    // Check which fields we already have cached
    const missingFieldIds = fieldIds.filter(id => !fieldNamesCache[id]);
    
    if (missingFieldIds.length === 0) {
      // All fields are cached, update state immediately
      setFieldNames({...fieldNamesCache});
      return;
    }

    // Create a cache key for this request
    const cacheKey = missingFieldIds.sort().join(',');
    
    // If there's already a pending request for these fields, wait for it
    if (cacheKey in pendingRequests) {
      pendingRequests[cacheKey].then(() => {
        setFieldNames({...fieldNamesCache});
      });
      return;
    }

    const fetchFieldNames = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const result = await getFieldNames({ fieldIds: missingFieldIds });
        if (result.success && result.data) {
          // Update global cache
          Object.assign(fieldNamesCache, result.data);
          // Update local state
          setFieldNames({...fieldNamesCache});
        } else {
          setError(!result.success ? result.error : 'Erro ao carregar nomes dos campos');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar nomes dos campos');
      } finally {
        setLoading(false);
        // Remove pending request
        delete pendingRequests[cacheKey];
      }
    };

    // Store the promise to avoid duplicate requests
    pendingRequests[cacheKey] = fetchFieldNames();
  }, [fieldIds]);

  const getFieldName = (fieldId: string): string => {
    const fieldInfo = fieldNames[fieldId];
    if (fieldInfo?.name) {
      return fieldInfo.name;
    }
    
    // Better fallback logic for common field patterns
    if (fieldId.includes('checkin') || fieldId.includes('check_in')) {
      return 'Check-in';
    }
    if (fieldId.includes('checkout') || fieldId.includes('check_out')) {
      return 'Check-out';
    }
    if (fieldId.includes('adult') || fieldId.includes('adulto')) {
      return 'Adultos';
    }
    if (fieldId.includes('child') || fieldId.includes('crianca')) {
      return 'Crianças';
    }
    if (fieldId.includes('room') || fieldId.includes('quarto')) {
      return 'Quartos';
    }
    if (fieldId.includes('name') || fieldId.includes('nome')) {
      return 'Nome';
    }
    if (fieldId.includes('date') || fieldId.includes('data')) {
      return 'Data';
    }
    
    // UUID pattern - try to get field name from server as fallback
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(fieldId)) {
      // For UUIDs that we couldn't resolve, show a user-friendly message
      return 'Campo personalizado';
    }
    
    // Format other field IDs
    return fieldId
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
      .replace(/\s+/g, ' ')
      .trim();
  };

  const getFieldInfo = (fieldId: string): FieldInfo | null => {
    return fieldNames[fieldId] || null;
  };

  return {
    getFieldName,
    getFieldInfo,
    loading,
    error
  };
}