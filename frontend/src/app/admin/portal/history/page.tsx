'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../../../lib/api';
import { getToken, getRole } from '../../../../lib/auth';
import styles from './page.module.css';

type HistoryItem = {
  id: number;
  datetime: string;
  username: string;
  concertName: string;
  action: string;
};

export default function AdminHistoryPage() {
  const router = useRouter();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!getToken() || getRole() !== 'admin') {
      router.push('/admin/login');
      return;
    }

    api.get('/reservations/history')
      .then((res) => setHistory(res.data))
      .catch(() => setError('Failed to fetch history'))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>Loading...</div>;
  }

  return (
    <div className={styles.tableWrap}>
      {error ? (
        <div style={{ color: '#dc2626', textAlign: 'center', padding: '2rem' }}>{error}</div>
      ) : history.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#999', padding: '2rem' }}>No reservation history found</div>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Date time</th>
              <th>Username</th>
              <th>Concert name</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {history.map((row) => (
              <tr key={row.id}>
                <td>{new Date(row.datetime).toLocaleString()}</td>
                <td>{row.username}</td>
                <td>{row.concertName}</td>
                <td style={{ color: row.action === 'Reserve' ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
                  {row.action}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
