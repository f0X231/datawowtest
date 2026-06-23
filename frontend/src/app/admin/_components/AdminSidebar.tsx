'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { logout } from '../../../lib/auth';
import styles from './AdminSidebar.module.css';

function HomeIcon() {
  return (
    <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function HistoryIcon() {
  return (
    <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
      <path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z" />
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

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/admin/access-level');
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.top}>
        <h1 className={styles.brand}>Admin</h1>
        <nav className={styles.nav}>
          <Link href="/admin/portal/home" className={`${styles.navItem} ${pathname.startsWith('/admin/portal/home') ? styles.active : ''}`}>
            <HomeIcon />
            Home
          </Link>
          <Link href="/admin/portal/history" className={`${styles.navItem} ${pathname.startsWith('/admin/portal/history') ? styles.active : ''}`}>
            <HistoryIcon />
            History
          </Link>
          <Link href="/admin/access-level" className={styles.navItem}>
            <SwitchIcon />
            Switch to user
          </Link>
        </nav>
      </div>

      <div className={styles.bottom}>
        <button
          className={styles.navItem}
          onClick={handleLogout}
          style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
        >
          <LogoutIcon />
          Logout
        </button>
      </div>
    </aside>
  );
}
