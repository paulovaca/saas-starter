'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CreateBaseItemModal } from './create-base-item-modal';
import styles from './create-base-item-button.module.css';

export function CreateBaseItemButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button 
        onClick={() => setIsModalOpen(true)}
        className={styles.button}
      >
        <Plus className={styles.icon} />
        Novo Item Base
      </Button>

      <CreateBaseItemModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen}
      />
    </>
  );
}
