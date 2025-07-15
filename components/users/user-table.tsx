'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Edit, Trash2, Shield, User, Mail, Phone, Calendar, MoreHorizontal, Eye, UserX, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserFormModal } from './user-form-modal';
import { toggleUserStatus } from '@/lib/actions/users/toggle-user-status';
import { deleteUser } from '@/lib/actions/users/delete-user';
import type { UserListItem } from '@/lib/db/schema/users';
import styles from './user-table.module.css';

type UserTableProps = {
  users: UserListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  currentPage: number;
  currentUserRole: 'DEVELOPER' | 'MASTER' | 'ADMIN' | 'AGENT';
};

export function UserTable({ users, pagination, currentPage, currentUserRole }: UserTableProps) {
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Permitir fechar o modal de confirmação com a tecla ESC
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showDeleteConfirm) {
        setShowDeleteConfirm(null);
      }
    };

    if (showDeleteConfirm) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevenir scroll da página quando o modal estiver aberto
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [showDeleteConfirm]);

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      MASTER: { label: 'Master', color: 'purple' },
      ADMIN: { label: 'Admin', color: 'blue' },
      AGENT: { label: 'Agente', color: 'green' },
      DEVELOPER: { label: 'Dev', color: 'orange' },
    };

    const config = roleConfig[role as keyof typeof roleConfig] || { label: role, color: 'gray' };
    
    return (
      <span className={`${styles.roleBadge} ${styles[`role${config.color}`]}`}>
        <Shield className={styles.roleIcon} />
        {config.label}
      </span>
    );
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <span className={`${styles.statusBadge} ${isActive ? styles.statusActive : styles.statusInactive}`}>
        {isActive ? 'Ativo' : 'Inativo'}
      </span>
    );
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Nunca';
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    setLoadingUserId(userId);
    try {
      const result = await toggleUserStatus(userId);
      if (result.error) {
        alert(result.error);
      } else {
        // A página será revalidada automaticamente pelo server action
        window.location.reload();
      }
    } catch (error) {
      alert('Erro ao alterar status do usuário');
    } finally {
      setLoadingUserId(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    setLoadingUserId(userId);
    try {
      const result = await deleteUser(userId);
      if (result.error) {
        alert(result.error);
      } else {
        setShowDeleteConfirm(null);
        // A página será revalidada automaticamente pelo server action
        window.location.reload();
      }
    } catch (error) {
      alert('Erro ao deletar usuário');
    } finally {
      setLoadingUserId(null);
    }
  };

  if (users.length === 0) {
    return (
      <div className={styles.emptyState}>
        <User className={styles.emptyIcon} />
        <h3 className={styles.emptyTitle}>Nenhum usuário encontrado</h3>
        <p className={styles.emptyDescription}>
          Não existem usuários que correspondam aos filtros aplicados.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead className={styles.tableHeader}>
            <tr>
              <th className={styles.headerCell}>Usuário</th>
              <th className={styles.headerCell}>Contato</th>
              <th className={styles.headerCell}>Permissão</th>
              <th className={styles.headerCell}>Status</th>
              <th className={styles.headerCell}>Último Acesso</th>
              <th className={styles.headerCell}>Criado em</th>
              <th className={styles.headerCell}>Ações</th>
            </tr>
          </thead>
          <tbody className={styles.tableBody}>
            {users.map((user) => (
              <tr key={user.id} className={styles.tableRow}>
                <td className={styles.cell}>
                  <div className={styles.userInfo}>
                    <div className={styles.avatar}>
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className={styles.avatarImage} />
                      ) : (
                        <User className={styles.avatarIcon} />
                      )}
                    </div>
                    <div className={styles.userDetails}>
                      <div className={styles.userName}>{user.name}</div>
                      <div className={styles.userEmail}>{user.email}</div>
                    </div>
                  </div>
                </td>
                
                <td className={styles.cell}>
                  <div className={styles.contactInfo}>
                    <div className={styles.contactItem}>
                      <Mail className={styles.contactIcon} />
                      <span className={styles.contactText}>{user.email}</span>
                    </div>
                    {user.phone && (
                      <div className={styles.contactItem}>
                        <Phone className={styles.contactIcon} />
                        <span className={styles.contactText}>{user.phone}</span>
                      </div>
                    )}
                  </div>
                </td>
                
                <td className={styles.cell}>
                  {getRoleBadge(user.role)}
                </td>
                
                <td className={styles.cell}>
                  {getStatusBadge(user.isActive)}
                </td>
                
                <td className={styles.cell}>
                  <div className={styles.dateInfo}>
                    <Calendar className={styles.dateIcon} />
                    <span className={styles.dateText}>
                      {formatDate(user.lastLogin)}
                    </span>
                  </div>
                </td>
                
                <td className={styles.cell}>
                  <div className={styles.dateInfo}>
                    <Calendar className={styles.dateIcon} />
                    <span className={styles.dateText}>
                      {formatDate(user.createdAt)}
                    </span>
                  </div>
                </td>
                
                <td className={styles.cell}>
                  <div className={styles.actions}>
                    <Link href={`/users/${user.id}`} className={styles.actionButton}>
                      <Eye className={styles.actionIcon} />
                    </Link>
                    
                    <UserFormModal user={user} currentUserRole={currentUserRole}>
                      <button className={styles.actionButton} type="button">
                        <Edit className={styles.actionIcon} />
                      </button>
                    </UserFormModal>
                    
                    <button
                      onClick={() => handleToggleStatus(user.id, user.isActive)}
                      disabled={loadingUserId === user.id}
                      className={`${styles.actionButton} ${user.isActive ? styles.deactivateButton : styles.activateButton}`}
                      type="button"
                    >
                      {loadingUserId === user.id ? (
                        <div className={styles.spinner} />
                      ) : user.isActive ? (
                        <UserX className={styles.actionIcon} />
                      ) : (
                        <UserCheck className={styles.actionIcon} />
                      )}
                    </button>
                    
                    <button
                      onClick={() => setShowDeleteConfirm(user.id)}
                      className={`${styles.actionButton} ${styles.deleteButton}`}
                      type="button"
                    >
                      <Trash2 className={styles.actionIcon} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      {pagination.totalPages > 1 && (
        <div className={styles.pagination}>
          <div className={styles.paginationInfo}>
            Mostrando {((currentPage - 1) * pagination.limit) + 1} a {Math.min(currentPage * pagination.limit, pagination.total)} de {pagination.total} usuários
          </div>
          
          <div className={styles.paginationControls}>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
              <Link
                key={page}
                href={`?page=${page}`}
                className={`${styles.paginationButton} ${page === currentPage ? styles.paginationActive : ''}`}
              >
                {page}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Modal de confirmação de exclusão */}
      {showDeleteConfirm && (
        <div className={styles.deleteModal}>
          <div className={styles.deleteModalContent}>
            <h3 className={styles.deleteModalTitle}>Confirmar Exclusão</h3>
            <p className={styles.deleteModalText}>
              Tem certeza que deseja deletar este usuário? Esta ação não pode ser desfeita.
            </p>
            <div className={styles.deleteModalActions}>
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(null)}
                disabled={loadingUserId === showDeleteConfirm}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDeleteUser(showDeleteConfirm)}
                disabled={loadingUserId === showDeleteConfirm}
              >
                {loadingUserId === showDeleteConfirm ? (
                  <>
                    <div className={styles.spinner} />
                    Deletando...
                  </>
                ) : (
                  'Deletar'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
