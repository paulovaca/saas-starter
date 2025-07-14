import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Settings,
  LogOut,
  UserPlus,
  Lock,
  UserCog,
  AlertCircle,
  UserMinus,
  Mail,
  CheckCircle,
  type LucideIcon,
} from 'lucide-react';
import { ActivityType } from '@/lib/db/schema';
import { getActivityLogs } from '@/lib/db/queries';
import styles from './page.module.css';

const iconMap: Partial<Record<ActivityType, LucideIcon>> = {
  [ActivityType.SIGN_UP]: UserPlus,
  [ActivityType.SIGN_IN]: UserCog,
  [ActivityType.SIGN_OUT]: LogOut,
  [ActivityType.UPDATE_PASSWORD]: Lock,
  [ActivityType.DELETE_ACCOUNT]: UserMinus,
  [ActivityType.UPDATE_ACCOUNT]: Settings,
  [ActivityType.CREATE_AGENCY]: UserPlus,
  [ActivityType.CREATE_CLIENT]: UserPlus,
  [ActivityType.UPDATE_CLIENT]: Settings,
  [ActivityType.DELETE_CLIENT]: UserMinus,
  [ActivityType.TRANSFER_CLIENT]: CheckCircle,
};

function getRelativeTime(date: Date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600)
    return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return date.toLocaleDateString();
}

function formatAction(action: ActivityType): string {
  switch (action) {
    case ActivityType.SIGN_UP:
      return 'You signed up';
    case ActivityType.SIGN_IN:
      return 'You signed in';
    case ActivityType.SIGN_OUT:
      return 'You signed out';
    case ActivityType.UPDATE_PASSWORD:
      return 'You changed your password';
    case ActivityType.DELETE_ACCOUNT:
      return 'You deleted your account';
    case ActivityType.UPDATE_ACCOUNT:
      return 'You updated your account';
    case ActivityType.CREATE_AGENCY:
      return 'You created a new agency';
    case ActivityType.CREATE_CLIENT:
      return 'You created a new client';
    case ActivityType.UPDATE_CLIENT:
      return 'You updated a client';
    case ActivityType.DELETE_CLIENT:
      return 'You deleted a client';
    case ActivityType.TRANSFER_CLIENT:
      return 'You transferred a client';
    default:
      return 'Unknown action occurred';
  }
}

export default async function ActivityPage() {
  const logs = await getActivityLogs();

  return (
    <section className={styles.container}>
      <h1 className={styles.title}>
        Activity Log
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length > 0 ? (
            <ul className={styles.activityList}>
              {logs.map((log) => {
                const Icon = iconMap[log.type as ActivityType] || Settings;
                const formattedAction = formatAction(
                  log.type as ActivityType
                );

                return (
                  <li key={log.id} className={styles.activityItem}>
                    <div className={styles.iconContainer}>
                      <Icon className={styles.icon} />
                    </div>
                    <div className={styles.activityContent}>
                      <p className={styles.activityText}>
                        {formattedAction}
                      </p>
                      <p className={styles.activityTime}>
                        {getRelativeTime(new Date(log.createdAt))}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className={styles.emptyState}>
              <AlertCircle className={styles.emptyIcon} />
              <h3 className={styles.emptyTitle}>
                No activity yet
              </h3>
              <p className={styles.emptyDescription}>
                When you perform actions like signing in or updating your
                account, they'll appear here.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
