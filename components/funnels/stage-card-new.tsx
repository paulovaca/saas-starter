import React, { useState } from 'react';
import { Trash2, Edit3, ChevronUp, ChevronDown, Save, X } from 'lucide-react';
import styles from './stage-card-new.module.css';

interface StageCardProps {
  id: string;
  name: string;
  description?: string | null;
  guidelines?: string | null;
  color: string;
  order: number;
  clientsCount?: number;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onMoveUp?: (id: string) => void;
  onMoveDown?: (id: string) => void;
  onUpdate?: (id: string, data: { name?: string; description?: string; guidelines?: string }) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

export default function StageCard({
  id,
  name,
  description,
  guidelines,
  color,
  order,
  clientsCount = 0,
  canMoveUp = false,
  canMoveDown = false,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  onUpdate,
  canEdit = true,
  canDelete = true,
}: StageCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: name,
    description: description || '',
    guidelines: guidelines || ''
  });

  const handleSave = () => {
    if (onUpdate && editData.name.trim()) {
      onUpdate(id, {
        name: editData.name.trim(),
        description: editData.description.trim() || undefined,
        guidelines: editData.guidelines.trim() || undefined
      });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditData({
      name: name,
      description: description || '',
      guidelines: guidelines || ''
    });
    setIsEditing(false);
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
    <div className={styles.card}>
      {/* Badge com cor e ordem */}
      <div className={`${styles.badge} ${getColorClass(color)}`}>
        {order}
      </div>

      {/* Botões de ordenação */}
      <div className={styles.orderControls}>
        <button
          type="button"
          className={`${styles.orderButton} ${!canMoveUp ? styles.disabled : ''}`}
          onClick={() => canMoveUp && onMoveUp?.(id)}
          disabled={!canMoveUp}
          title="Mover para cima"
        >
          <ChevronUp size={16} />
        </button>
        <button
          type="button"
          className={`${styles.orderButton} ${!canMoveDown ? styles.disabled : ''}`}
          onClick={() => canMoveDown && onMoveDown?.(id)}
          disabled={!canMoveDown}
          title="Mover para baixo"
        >
          <ChevronDown size={16} />
        </button>
      </div>

      {/* Conteúdo da etapa */}
      <div className={styles.content}>
        {isEditing ? (
          <div className={styles.editForm}>
            {/* Nome */}
            <div className={styles.field}>
              <label className={styles.label}>Nome da etapa</label>
              <input
                type="text"
                value={editData.name}
                onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                className={styles.input}
                maxLength={255}
                placeholder="Nome da etapa"
              />
            </div>

            {/* Descrição */}
            <div className={styles.field}>
              <label className={styles.label}>Descrição</label>
              <textarea
                value={editData.description}
                onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                className={styles.textarea}
                rows={3}
                placeholder="Descrição da etapa"
              />
            </div>

            {/* Diretrizes */}
            <div className={styles.field}>
              <label className={styles.label}>Diretrizes</label>
              <textarea
                value={editData.guidelines}
                onChange={(e) => setEditData(prev => ({ ...prev, guidelines: e.target.value }))}
                className={styles.textarea}
                rows={4}
                placeholder="Diretrizes para execução desta etapa"
              />
            </div>

            {/* Botões de ação */}
            <div className={styles.editActions}>
              <button
                type="button"
                onClick={handleSave}
                className={`${styles.actionButton} ${styles.saveButton}`}
                title="Salvar alterações"
              >
                <Save size={16} />
                Salvar
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className={`${styles.actionButton} ${styles.cancelButton}`}
                title="Cancelar edição"
              >
                <X size={16} />
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.viewMode}>
            {/* Nome da etapa */}
            <h3 className={styles.name}>{name}</h3>

            {/* Descrição */}
            {description && (
              <div className={styles.section}>
                <h4 className={styles.sectionTitle}>Descrição</h4>
                <p className={styles.description}>{description}</p>
              </div>
            )}

            {/* Diretrizes */}
            {guidelines && (
              <div className={styles.section}>
                <h4 className={styles.sectionTitle}>Diretrizes</h4>
                <p className={styles.guidelines}>{guidelines}</p>
              </div>
            )}

            {/* Contador de clientes */}
            <div className={styles.stats}>
              <span className={styles.clientsCount}>
                {clientsCount} {clientsCount === 1 ? 'cliente' : 'clientes'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Ações */}
      {!isEditing && (
        <div className={styles.actions}>
          {canEdit && (
            <button
              type="button"
              className={styles.actionButton}
              onClick={() => setIsEditing(true)}
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
      )}
    </div>
  );
}
