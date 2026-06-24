'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../../../lib/api';
import { getToken, getRole } from '../../../../lib/auth';
import styles from './page.module.css';

function PersonIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function AwardIcon() {
  return (
    <svg className={styles.statIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="7" />
      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
    </svg>
  );
}

function XCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );
}

function XCircleFilledIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2" />
    </svg>
  );
}

function SaveIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
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

type Concert = {
  id: number;
  name: string;
  description: string;
  totalSeats: number;
  availableSeats: number;
  reservedCount: number;
};

export default function AdminHomePage() {
  const router = useRouter();
  const [tab, setTab] = useState<'overview' | 'create'>('overview');
  const [concerts, setConcerts] = useState<Concert[]>([]);
  const [stats, setStats] = useState({ totalSeats: 0, totalReserved: 0, totalCancelled: 0 });
  const [deleteTarget, setDeleteTarget] = useState<Concert | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', seats: 500, description: '' });

  const fetchData = async () => {
    try {
      const [concertsRes, statsRes] = await Promise.all([
        api.get('/concerts'),
        api.get('/concerts/stats'),
      ]);
      setConcerts(concertsRes.data);
      setStats(statsRes.data);
    } catch {
      // interceptor handles 401
    }
  };

  useEffect(() => {
    if (!getToken() || getRole() !== 'admin') {
      router.push('/admin/login');
      return;
    }
    fetchData();
  }, [router]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const handleCreate = async () => {
    if (!form.name.trim()) {
      setError('กรุณากรอกชื่อคอนเสิร์ต');
      return;
    }
    setError(null);
    try {
      await api.post('/concerts', {
        name: form.name.trim(),
        description: form.description,
        totalSeats: form.seats,
      });
      setForm({ name: '', seats: 500, description: '' });
      setTab('overview');
      setToast('สร้างคอนเสิร์ตสำเร็จ');
      fetchData();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(typeof msg === 'string' ? msg : 'ไม่สามารถสร้างคอนเสิร์ตได้');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setError(null);
    try {
      await api.delete(`/concerts/${deleteTarget.id}`);
      setDeleteTarget(null);
      setToast('ลบคอนเสิร์ตสำเร็จ');
      fetchData();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setDeleteTarget(null);
      setError(typeof msg === 'string' ? msg : 'ไม่สามารถลบคอนเสิร์ตได้');
    }
  };

  return (
    <>
      {toast && (
        <div className={styles.toast}>
          <CheckCircleIcon />
          <span>{toast}</span>
          <button className={styles.toastClose} onClick={() => setToast(null)}>&times;</button>
        </div>
      )}

      {error && (
        <div style={{ background: '#fef2f2', color: '#dc2626', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', border: '1px solid #fecaca', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{error}</span>
          <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: '16px', lineHeight: 1 }}>&times;</button>
        </div>
      )}

      <div className={styles.stats}>
        <div className={`${styles.statCard} ${styles.blue}`}>
          <PersonIcon className={styles.statIcon} />
          <span className={styles.statLabel}>Total of seats</span>
          <strong className={styles.statValue}>{stats.totalSeats}</strong>
        </div>
        <div className={`${styles.statCard} ${styles.teal}`}>
          <AwardIcon />
          <span className={styles.statLabel}>Reserve</span>
          <strong className={styles.statValue}>{stats.totalReserved}</strong>
        </div>
        <div className={`${styles.statCard} ${styles.red}`}>
          <XCircleIcon className={styles.statIcon} />
          <span className={styles.statLabel}>Cancel</span>
          <strong className={styles.statValue}>{stats.totalCancelled}</strong>
        </div>
      </div>

      <div className={styles.tabs}>
        <button className={`${styles.tab} ${tab === 'overview' ? styles.activeTab : ''}`} onClick={() => setTab('overview')}>
          Overview
        </button>
        <button className={`${styles.tab} ${tab === 'create' ? styles.activeTab : ''}`} onClick={() => setTab('create')}>
          Create
        </button>
      </div>

      {tab === 'overview' && (
        <div className={styles.concertList}>
          {concerts.length === 0 ? (
            <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#999', margin: '2rem 0' }}>
              ยังไม่มีคอนเสิร์ต
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
                    {concert.totalSeats} seats ({concert.availableSeats} available)
                  </span>
                  <button className={styles.deleteBtn} onClick={() => setDeleteTarget(concert)}>
                    <TrashIcon />
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'create' && (
        <div className={styles.createCard}>
          <h2 className={styles.createTitle}>Create</h2>
          <hr className={styles.divider} />

          <div className={styles.formRow}>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Concert Name</label>
              <input
                className={styles.input}
                type="text"
                placeholder="Please input concert name"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Total of seat</label>
              <div className={styles.inputWrap}>
                <input
                  className={`${styles.input} ${styles.inputWithIcon}`}
                  type="number"
                  min={1}
                  value={form.seats}
                  onChange={(e) => setForm((p) => ({ ...p, seats: Number(e.target.value) }))}
                />
                <span className={styles.inputIcon}><PersonIcon /></span>
              </div>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>Description</label>
            <textarea
              className={styles.textarea}
              placeholder="Please input description"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              rows={5}
            />
          </div>

          <div className={styles.formActions}>
            <button className={styles.saveBtn} onClick={handleCreate}>
              <SaveIcon />
              Save
            </button>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className={styles.overlay} onClick={() => setDeleteTarget(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalIconWrap}><XCircleFilledIcon /></div>
            <p className={styles.modalQuestion}>Are you sure to delete?</p>
            <p className={styles.modalName}>&ldquo;{deleteTarget.name}&rdquo;</p>
            <div className={styles.modalActions}>
              <button className={styles.cancelModalBtn} onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className={styles.confirmDeleteBtn} onClick={handleDelete}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
