import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import styles from './loading.module.css';

export default function ActivityPageSkeleton() {
  return (
    <section className={styles.container}>
      <h1 className={styles.title}>
        Activity Log
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className={styles.content} />
      </Card>
    </section>
  );
}
