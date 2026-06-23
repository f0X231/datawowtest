import AdminSidebar from '../_components/AdminSidebar';
import styles from './layout.module.css';

export default function AdminPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.frame}>
        <AdminSidebar />
        <main className={styles.main}>{children}</main>
      </div>
    </div>
  );
}
