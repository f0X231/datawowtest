'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

type HistoryItem = {
  id: number;
  datetime: string;
  username: string;
  concertName: string;
  action: string;
};

export default function AdminHistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    fetch('http://localhost:3000/api/reservations/history', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.status === 401) {
          router.push('/admin/login');
          throw new Error('Unauthorized');
        }
        return res.json();
      })
      .then((data) => {
        setHistory(data);
      })
      .catch((err) => {
        if (err.message !== 'Unauthorized') {
          setError('Failed to fetch history');
        }
      });
  }, [router]);

  return (
    <div className={styles.tableWrap}>
      {error ? (
        <div style={{ color: '#ff4d4d', textAlign: 'center', padding: '2rem' }}>
          {error}
        </div>
      ) : history.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#999', padding: '2rem' }}>
          No reservation history found
        </div>
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
                <td style={{ color: row.action === 'Reserve' ? '#00e676' : '#ff1744', fontWeight: 'bold' }}>
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
