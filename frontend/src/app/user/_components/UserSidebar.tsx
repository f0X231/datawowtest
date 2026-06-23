'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from '../../admin/_components/AdminSidebar.module.css';

function HomeIcon() {
  return (
    <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function SwitchIcon() {
  return (
    <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1 4 1 10 7 10" />
      <polyline points="23 20 23 14 17 14" />
      <path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

export default function UserSidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.top}>
        <h1 className={styles.brand}>User</h1>
        <nav className={styles.nav}>
          <Link
            href="/user/portal/home"
            className={`${styles.navItem} ${pathname.startsWith('/user/portal/home') ? styles.active : ''}`}
          >
            <HomeIcon />
            Home
          </Link>
          <Link href="/admin/access-level" className={styles.navItem}>
            <SwitchIcon />
            Switch to Admin
          </Link>
        </nav>
      </div>

      <div className={styles.bottom}>
        <Link href="/admin/access-level" className={styles.navItem}>
          <LogoutIcon />
          Logout
        </Link>
      </div>
    </aside>
  );
}
