'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

// ─── Icons ────────────────────────────────────────────────────────────────────
function PersonIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg className={styles.toastIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────
type Concert = {
  id: number;
  name: string;
  description: string;
  totalSeats: number;
  availableSeats: number;
  reservedCount: number;
  userReserved: boolean;
};

type HistoryItem = {
  id: number;
  datetime: string;
  concertName: string;
  action: string;
};

export default function UserHomePage() {
  const [tab, setTab] = useState<'concerts' | 'history'>('concerts');
  const [concerts, setConcerts] = useState<Concert[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const router = useRouter();

  const loadData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/user/login');
      return;
    }

    try {
      // 1. Fetch Concerts
      const resConcerts = await fetch('http://localhost:3000/api/concerts', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resConcerts.status === 401) {
        router.push('/user/login');
        return;
      }
      const dataConcerts = await resConcerts.json();
      setConcerts(dataConcerts);

      // 2. Fetch History
      const resHistory = await fetch('http://localhost:3000/api/reservations/history/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const dataHistory = await resHistory.json();
      setHistory(dataHistory);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch data');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const handleReserve = async (concertId: number) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setActionLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:3000/api/reservations/reserve/${concertId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to reserve seat');
      }
      setToast('Reserve successfully');
      loadData();
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async (concertId: number) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setActionLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:3000/api/reservations/cancel/${concertId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to cancel reservation');
      }
      setToast('Cancel successfully');
      loadData();
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <>
      {/* Toast */}
      {toast && (
        <div className={styles.toast}>
          <CheckCircleIcon />
          <span>{toast}</span>
          <button className={styles.toastClose} onClick={() => setToast(null)}>
            &times;
          </button>
        </div>
      )}

      {/* Global Error Banner */}
      {error && (
        <div style={{ background: '#ffebee', color: '#c62828', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', border: '1px solid #ffcdd2' }}>
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${tab === 'concerts' ? styles.activeTab : ''}`}
          onClick={() => setTab('concerts')}
        >
          Concerts
        </button>
        <button
          className={`${styles.tab} ${tab === 'history' ? styles.activeTab : ''}`}
          onClick={() => setTab('history')}
        >
          My History
        </button>
      </div>

      {/* Concerts Discovery Tab */}
      {tab === 'concerts' && (
        <div className={styles.concertList}>
          {concerts.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#999', margin: '2rem 0' }}>
              No concerts available
            </p>
          ) : (
            concerts.map((concert) => (
              <div key={concert.id} className={styles.concertCard}>
                <h2 className={styles.concertName}>{concert.name}</h2>
                <hr className={styles.divider} />
                <p className={styles.concertDesc}>{concert.description || 'No description provided.'}</p>
                <div className={styles.concertFooter}>
                  <span className={styles.seatCount}>
                    <PersonIcon className={styles.seatIcon} />
                    {concert.totalSeats.toLocaleString()} seats ({concert.availableSeats} available)
                  </span>

                  {concert.userReserved ? (
                    <button
                      className={styles.cancelBtn}
                      disabled={actionLoading}
                      onClick={() => handleCancel(concert.id)}
                    >
                      Cancel
                    </button>
                  ) : concert.availableSeats > 0 ? (
                    <button
                      className={styles.reserveBtn}
                      disabled={actionLoading}
                      onClick={() => handleReserve(concert.id)}
                    >
                      Reserve
                    </button>
                  ) : (
                    <button
                      className={styles.reserveBtn}
                      disabled={true}
                      style={{ opacity: 0.6 }}
                    >
                      Fully Booked
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Personal History Tab */}
      {tab === 'history' && (
        <div className={styles.tableWrap}>
          {history.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#999', padding: '2rem' }}>
              You haven't reserved any concerts yet.
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Date time</th>
                  <th>Concert name</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {history.map((row) => (
                  <tr key={row.id}>
                    <td>{new Date(row.datetime).toLocaleString()}</td>
                    <td>{row.concertName}</td>
                    <td style={{ color: row.action === 'Reserve' ? '#00e676' : '#ff1744', fontWeight: 'bold' }}>
                      {row.action}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </>
  );
}
