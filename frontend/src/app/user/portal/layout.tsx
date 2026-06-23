import UserSidebar from '../_components/UserSidebar';
import styles from '../../admin/portal/layout.module.css';

export default function UserPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.frame}>
        <UserSidebar />
        <main className={styles.main}>{children}</main>
      </div>
    </div>
  );
}
