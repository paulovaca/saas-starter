import { logActivity as dbLogActivity, createSystemNotification } from '@/lib/db/queries/activity';
import { ActivityType } from '@/lib/db/schema/activity';

/**
 * Service for logging user and system activities
 */
export class ActivityLogger {
  /**
   * Log user activity with context
   */
  static async logUserActivity(
    agencyId: string,
    userId: string,
    type: ActivityType,
    description?: string,
    entityType?: string,
    entityId?: string,
    metadata?: Record<string, any>
  ) {
    try {
      await dbLogActivity(
        agencyId,
        userId,
        type,
        description,
        entityType,
        entityId,
        metadata
      );
    } catch (error) {
      console.error('Failed to log user activity:', error);
      // Don't throw - logging should not break the main flow
    }
  }

  /**
   * Log system activity (no user)
   */
  static async logSystemActivity(
    agencyId: string,
    type: ActivityType,
    description?: string,
    entityType?: string,
    entityId?: string,
    metadata?: Record<string, any>
  ) {
    try {
      await dbLogActivity(
        agencyId,
        null,
        type,
        description,
        entityType,
        entityId,
        metadata
      );
    } catch (error) {
      console.error('Failed to log system activity:', error);
    }
  }

  /**
   * Create notification for user
   */
  static async notifyUser(
    userId: string,
    agencyId: string,
    title: string,
    message: string,
    type: 'info' | 'warning' | 'error' | 'success' = 'info',
    metadata?: Record<string, any>,
    expiresAt?: Date
  ) {
    try {
      await createSystemNotification({
        title,
        message,
        type,
        userId,
        agencyId,
        metadata,
        expiresAt,
      });
    } catch (error) {
      console.error('Failed to create user notification:', error);
    }
  }

  /**
   * Create system-wide notification for agency
   */
  static async notifyAgency(
    agencyId: string,
    title: string,
    message: string,
    type: 'info' | 'warning' | 'error' | 'success' = 'info',
    metadata?: Record<string, any>,
    expiresAt?: Date
  ) {
    try {
      await createSystemNotification({
        title,
        message,
        type,
        userId: null,
        agencyId,
        metadata,
        expiresAt,
      });
    } catch (error) {
      console.error('Failed to create agency notification:', error);
    }
  }

  /**
   * Helper method to log authentication activities
   */
  static async logAuth(
    agencyId: string,
    userId: string,
    type: 'SIGN_IN' | 'SIGN_OUT' | 'SIGN_UP',
    ipAddress?: string,
    userAgent?: string
  ) {
    const descriptions = {
      SIGN_IN: 'Usuário fez login',
      SIGN_OUT: 'Usuário fez logout',
      SIGN_UP: 'Usuário se registrou',
    };

    await this.logUserActivity(
      agencyId,
      userId,
      ActivityType[type],
      descriptions[type],
      'user',
      userId,
      { ipAddress, userAgent }
    );
  }

  /**
   * Helper method to log client activities
   */
  static async logClientActivity(
    agencyId: string,
    userId: string,
    clientId: string,
    type: 'CREATE_CLIENT' | 'UPDATE_CLIENT' | 'DELETE_CLIENT' | 'TRANSFER_CLIENT',
    description?: string,
    metadata?: Record<string, any>
  ) {
    const defaultDescriptions = {
      CREATE_CLIENT: 'Cliente criado',
      UPDATE_CLIENT: 'Cliente atualizado',
      DELETE_CLIENT: 'Cliente excluído',
      TRANSFER_CLIENT: 'Cliente transferido',
    };

    await this.logUserActivity(
      agencyId,
      userId,
      ActivityType[type],
      description || defaultDescriptions[type],
      'client',
      clientId,
      metadata
    );
  }

  /**
   * Helper method to log agency activities
   */
  static async logAgencyActivity(
    agencyId: string,
    userId: string,
    type: 'CREATE_AGENCY' | 'UPDATE_AGENCY',
    description?: string,
    metadata?: Record<string, any>
  ) {
    const defaultDescriptions = {
      CREATE_AGENCY: 'Agência criada',
      UPDATE_AGENCY: 'Agência atualizada',
    };

    await this.logUserActivity(
      agencyId,
      userId,
      ActivityType[type],
      description || defaultDescriptions[type],
      'agency',
      agencyId,
      metadata
    );
  }

  /**
   * Helper method to log user management activities
   */
  static async logUserManagement(
    agencyId: string,
    performedByUserId: string,
    targetUserId: string,
    type: 'INVITE_USER' | 'ACCEPT_INVITATION' | 'CHANGE_USER_ROLE' | 'DEACTIVATE_USER' | 'ACTIVATE_USER',
    description?: string,
    metadata?: Record<string, any>
  ) {
    const defaultDescriptions = {
      INVITE_USER: 'Usuário convidado',
      ACCEPT_INVITATION: 'Convite aceito',
      CHANGE_USER_ROLE: 'Função do usuário alterada',
      DEACTIVATE_USER: 'Usuário desativado',
      ACTIVATE_USER: 'Usuário ativado',
    };

    await this.logUserActivity(
      agencyId,
      performedByUserId,
      ActivityType[type],
      description || defaultDescriptions[type],
      'user',
      targetUserId,
      metadata
    );
  }

  /**
   * Helper method to log payment activities
   */
  static async logPayment(
    agencyId: string,
    type: 'PAYMENT_SUCCESS' | 'PAYMENT_FAILED' | 'SUBSCRIPTION_CREATED' | 'SUBSCRIPTION_UPDATED' | 'SUBSCRIPTION_CANCELLED',
    description?: string,
    metadata?: Record<string, any>
  ) {
    const defaultDescriptions = {
      PAYMENT_SUCCESS: 'Pagamento processado com sucesso',
      PAYMENT_FAILED: 'Falha no processamento do pagamento',
      SUBSCRIPTION_CREATED: 'Assinatura criada',
      SUBSCRIPTION_UPDATED: 'Assinatura atualizada',
      SUBSCRIPTION_CANCELLED: 'Assinatura cancelada',
    };

    await this.logSystemActivity(
      agencyId,
      ActivityType[type],
      description || defaultDescriptions[type],
      'payment',
      undefined,
      metadata
    );
  }
}

// Export a simple function for backward compatibility
export const logActivity = ActivityLogger.logUserActivity;
