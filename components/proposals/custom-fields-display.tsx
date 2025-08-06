'use client';

import React from 'react';
import { useFieldNames } from '@/hooks/use-field-names';

interface CustomFieldsDisplayProps {
  customFields: Record<string, any> | null | undefined;
  className?: string;
}

export function CustomFieldsDisplay({ customFields, className }: CustomFieldsDisplayProps) {
  const { getFieldName, getFieldInfo, loading } = useFieldNames(customFields);

  if (!customFields || Object.keys(customFields).length === 0) {
    return null;
  }

  if (loading) {
    return <div className={className}>Carregando campos...</div>;
  }

  const formatValue = (value: any) => {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    if (typeof value === 'boolean') {
      return value ? 'Sim' : 'Não';
    }

    if (typeof value === 'object') {
      return JSON.stringify(value);
    }

    // Try to format as date if it looks like one
    if (typeof value === 'string') {
      // ISO date pattern
      if (value.match(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2})?/)) {
        try {
          const date = new Date(value);
          if (!isNaN(date.getTime())) {
            return date.toLocaleDateString('pt-BR');
          }
        } catch {}
      }
    }

    return String(value);
  };

  const visibleFields = Object.entries(customFields).filter(([_, value]) => {
    return value !== null && value !== undefined && value !== '';
  });

  if (visibleFields.length === 0) {
    return null;
  }

  // Sort fields by creation date when available
  const sortedFields = visibleFields.sort(([fieldIdA], [fieldIdB]) => {
    const fieldInfoA = getFieldInfo(fieldIdA);
    const fieldInfoB = getFieldInfo(fieldIdB);
    
    if (fieldInfoA?.createdAt && fieldInfoB?.createdAt) {
      return fieldInfoA.createdAt.getTime() - fieldInfoB.createdAt.getTime();
    }
    
    // Fallback to alphabetical order if no creation dates
    return getFieldName(fieldIdA).localeCompare(getFieldName(fieldIdB));
  });

  return (
    <div className={className}>
      {sortedFields.map(([fieldId, value]) => {
        const formattedValue = formatValue(value);
        if (formattedValue === null) return null;

        return (
          <div key={fieldId} style={{ 
            display: 'flex', 
            gap: '0.5rem', 
            alignItems: 'flex-start',
            fontSize: '0.8125rem',
            marginBottom: '0.25rem'
          }}>
            <span style={{ 
              color: 'var(--muted-foreground)', 
              fontWeight: 500,
              minWidth: 'fit-content'
            }}>
              {getFieldName(fieldId)}:
            </span>
            <span style={{ 
              color: 'var(--card-foreground)',
              flex: 1
            }}>
              {formattedValue}
            </span>
          </div>
        );
      })}
    </div>
  );
}