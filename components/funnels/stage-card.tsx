import React, { useState } from 'react';
import { Trash2, Edit3, GripVertical } from 'lucide-react';
import styles from './stage-card.module.css';

interface StageCardProps {
  id: string;
  name: string;
  description?: string | null;
  color: string;
  order: number;
  clientsCount?: number;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onNameChange?: (id: string, newName: string) => void;
  isDragging?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  onDragStart?: (id: string) => void;
  onDragEnd?: () => void;
}

export default function StageCard({
  id,
  name,
  description,
  color,
  order,
  clientsCount = 0,
  onEdit,
  onDelete,
  onNameChange,
  isDragging = false,
  canEdit = true,
  canDelete = true,
  onDragStart,
  onDragEnd,
}: StageCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(name);

  const handleNameSubmit = () => {
    if (editName.trim() && editName !== name && onNameChange) {
      onNameChange(id, editName.trim());
    }
    setIsEditing(false);
    setEditName(name);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameSubmit();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditName(name);
    }
  };

  const getColorClass = (colorName: string) => {
    const colorMap: Record<string, string> = {
      blue: styles.colorBlue,
      green: styles.colorGreen,
      yellow: styles.colorYellow,
      red: styles.colorRed,
      purple: styles.colorPurple,
      gray: styles.colorGray,
      orange: styles.colorOrange,
      pink: styles.colorPink,
    };
    return colorMap[colorName] || styles.colorBlue;
  };

  return (
    <div 
      className={`${styles.card} ${isDragging ? styles.dragging : ''}`}
      data-stage-id={id}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', id);
        e.dataTransfer.effectAllowed = 'move';
        onDragStart?.(id);
      }}
      onDragEnd={() => {
        onDragEnd?.();
      }}
    >
      {/* Handle para arrastar */}
      <div className={styles.dragHandle}>
        <GripVertical size={16} />
      </div>

      {/* Badge com cor e ordem */}
      <div className={`${styles.badge} ${getColorClass(color)}`}>
        {order}
      </div>

      {/* Conteúdo da etapa */}
      <div className={styles.content}>
        {/* Nome da etapa (editável inline) */}
        {isEditing ? (
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleNameSubmit}
            onKeyDown={handleKeyPress}
            className={styles.nameInput}
            autoFocus
            maxLength={255}
          />
        ) : (
          <h3 
            className={styles.name}
            onClick={() => canEdit && setIsEditing(true)}
            title={canEdit ? 'Clique para editar' : name}
          >
            {name}
          </h3>
        )}

        {/* Descrição */}
        {description && (
          <p className={styles.description} title={description}>
            {description}
          </p>
        )}

        {/* Contador de clientes */}
        <div className={styles.stats}>
          <span className={styles.clientsCount}>
            {clientsCount} {clientsCount === 1 ? 'cliente' : 'clientes'}
          </span>
        </div>
      </div>

      {/* Ações */}
      <div className={styles.actions}>
        {canEdit && (
          <button
            type="button"
            className={styles.actionButton}
            onClick={() => onEdit(id)}
            title="Editar etapa"
            aria-label="Editar etapa"
          >
            <Edit3 size={16} />
          </button>
        )}
        
        {canDelete && (
          <button
            type="button"
            className={`${styles.actionButton} ${styles.deleteButton}`}
            onClick={() => onDelete(id)}
            title="Excluir etapa"
            aria-label="Excluir etapa"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
