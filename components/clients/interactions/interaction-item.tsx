'use client';

import React, { useState } from 'react';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { INTERACTION_TYPES } from '@/lib/types/interactions';
import type { InteractionWithUser } from '@/lib/types/interactions';
import styles from './interaction-item.module.css';

interface InteractionItemProps {
  interaction: InteractionWithUser;
}

export function InteractionItem({ interaction }: InteractionItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const interactionConfig = INTERACTION_TYPES[interaction.type];
  const hasLongDescription = interaction.description.length > 150;
  const truncatedDescription = hasLongDescription 
    ? interaction.description.substring(0, 150) + '...'
    : interaction.description;

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  const formatTime = (date: Date): string => {
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes}min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.typeInfo}>
            <div className={`${styles.typeIcon} ${styles[`type${interactionConfig.color}`]}`}>
              {interactionConfig.icon}
            </div>
            <div className={styles.typeDetails}>
              <span className={styles.typeLabel}>{interactionConfig.label}</span>
              <div className={styles.metadata}>
                <span className={styles.date}>
                  {formatDate(interaction.contactDate)} às {formatTime(interaction.contactDate)}
                </span>
                {interaction.durationMinutes && (
                  <>
                    <span className={styles.separator}>•</span>
                    <span className={styles.duration}>
                      <Clock className={styles.durationIcon} />
                      {formatDuration(interaction.durationMinutes)}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className={styles.userInfo}>
            <Avatar className={styles.avatar}>
              <span className={styles.avatarFallback}>
                {interaction.user.name.charAt(0).toUpperCase()}
              </span>
            </Avatar>
            <span className={styles.userName}>{interaction.user.name}</span>
          </div>
        </div>

        {/* Description */}
        <div className={styles.description}>
          <p className={styles.descriptionText}>
            {isExpanded || !hasLongDescription ? interaction.description : truncatedDescription}
          </p>
          
          {hasLongDescription && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className={styles.expandButton}
            >
              {isExpanded ? (
                <>
                  <ChevronUp className={styles.expandIcon} />
                  Mostrar menos
                </>
              ) : (
                <>
                  <ChevronDown className={styles.expandIcon} />
                  Mostrar mais
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
