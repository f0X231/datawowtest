import Link from 'next/link';
import styles from './page.module.css';

function UserCardIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      width="64"
      height="64"
    >
      <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-6 3.5c1.38 0 2.5 1.12 2.5 2.5S13.38 10.5 12 10.5 9.5 9.38 9.5 8 10.62 5.5 12 5.5zM17 17H7v-.75C7 14.58 10.33 13.75 12 13.75s5 .83 5 2.5V17z" />
    </svg>
  );
}

function AdminCardIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      width="64"
      height="64"
    >
      <path d="M10 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h9.54c-.23-.63-.54-1.47-.54-2.43 0-.34.03-.67.08-1H2v-.58C2.57 15.34 6.27 14 10 14c.48 0 .96.04 1.43.1.36-.61.79-1.16 1.28-1.64C11.9 12.1 11.09 12 10 12zm9.5 3.5-1.09 2.44-2.66.25 1.92 1.74-.55 2.62L19.5 21l2.38 1.55-.55-2.62 1.92-1.74-2.66-.25z" />
    </svg>
  );
}

const LOREM =
  'Lorem ipsum dolor sit amet consectetur. Elit purus nam gravida porttitor nibh urna sit ornare a. Proin dolor morbi id ornare aenean non';

export default function AccessLevelPage() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.content}>
        <div className={styles.brand}>
          <div className={styles.brandCircle} />
          <span className={styles.brandName}>BRAND</span>
        </div>

        <div className={styles.header}>
          <h1 className={styles.title}>Select Access Level</h1>
          <p className={styles.subtitle}>
            Lorem ipsum dolor sit amet consectetur. Elit purus nam.
          </p>
        </div>

        <div className={styles.cards}>
          {/* User Card */}
          <div className={styles.card}>
            <div className={styles.cardIconWrap}>
              <UserCardIcon />
            </div>
            <h2 className={styles.cardTitle}>User</h2>
            <p className={styles.cardDesc}>{LOREM}</p>
            <Link href="/user/login" className={styles.enterBtn}>
              Enter Workspace &rarr;
            </Link>
          </div>

          {/* Administrator Card */}
          <div className={`${styles.card} ${styles.adminCard}`}>
            <div className={styles.cardIconWrap}>
              <AdminCardIcon />
            </div>
            <h2 className={styles.cardTitle}>Administrator</h2>
            <p className={styles.cardDesc}>{LOREM}</p>
            <Link href="/admin/login" className={styles.enterPortalBtn}>
              Enter Portal &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
