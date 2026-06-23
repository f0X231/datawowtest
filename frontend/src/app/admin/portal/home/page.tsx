'use client';

import { useEffect, useState } from 'react';
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

// ─── Types & Data ─────────────────────────────────────────────────────────────
type Concert = { id: number; name: string; description: string; seats: number };

const LOREM_LONG =
  'Lorem ipsum dolor sit amet consectetur. Elit purus nam gravida porttitor nibh urna sit ornare a. Proin dolor morbi id ornare aenean non. Fusce dignissim turpis sed non est orci sed in. Blandit ut purus nunc sed donec commodo morbi diam scelerisque.';

const LOREM_SHORT =
  'Lorem ipsum dolor sit amet consectetur. Elit purus nam gravida porttitor nibh urna sit ornare a.';

const INITIAL_CONCERTS: Concert[] = [
  { id: 1, name: 'Concert Name 1', description: LOREM_LONG, seats: 500 },
  { id: 2, name: 'Concert Name 2', description: LOREM_SHORT, seats: 200 },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function AdminHomePage() {
  const [tab, setTab] = useState<'overview' | 'create'>('overview');
  const [concerts, setConcerts] = useState<Concert[]>(INITIAL_CONCERTS);
  const [deleteTarget, setDeleteTarget] = useState<Concert | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', seats: 500, description: '' });

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const handleCreate = () => {
    if (!form.name.trim()) return;
    setConcerts((prev) => [
      ...prev,
      { id: Date.now(), name: form.name.trim(), description: form.description, seats: form.seats },
    ]);
    setForm({ name: '', seats: 500, description: '' });
    setTab('overview');
    setToast('Create successfully');
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setConcerts((prev) => prev.filter((c) => c.id !== deleteTarget.id));
    setDeleteTarget(null);
    setToast('Delete successfully');
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

      {/* Stat Cards */}
      <div className={styles.stats}>
        <div className={`${styles.statCard} ${styles.blue}`}>
          <PersonIcon className={styles.statIcon} />
          <span className={styles.statLabel}>Total of seats</span>
          <strong className={styles.statValue}>500</strong>
        </div>
        <div className={`${styles.statCard} ${styles.teal}`}>
          <AwardIcon />
          <span className={styles.statLabel}>Reserve</span>
          <strong className={styles.statValue}>120</strong>
        </div>
        <div className={`${styles.statCard} ${styles.red}`}>
          <XCircleIcon className={styles.statIcon} />
          <span className={styles.statLabel}>Cancel</span>
          <strong className={styles.statValue}>12</strong>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${tab === 'overview' ? styles.activeTab : ''}`}
          onClick={() => setTab('overview')}
        >
          Overview
        </button>
        <button
          className={`${styles.tab} ${tab === 'create' ? styles.activeTab : ''}`}
          onClick={() => setTab('create')}
        >
          Create
        </button>
      </div>

      {/* Overview Tab */}
      {tab === 'overview' && (
        <div className={styles.concertList}>
          {concerts.map((concert) => (
            <div key={concert.id} className={styles.concertCard}>
              <h2 className={styles.concertName}>{concert.name}</h2>
              <hr className={styles.divider} />
              <p className={styles.concertDesc}>{concert.description}</p>
              <div className={styles.concertFooter}>
                <span className={styles.seatCount}>
                  <PersonIcon className={styles.seatIcon} />
                  {concert.seats}
                </span>
                <button
                  className={styles.deleteBtn}
                  onClick={() => setDeleteTarget(concert)}
                >
                  <TrashIcon />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Tab */}
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
                <span className={styles.inputIcon}>
                  <PersonIcon />
                </span>
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

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className={styles.overlay} onClick={() => setDeleteTarget(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalIconWrap}>
              <XCircleFilledIcon />
            </div>
            <p className={styles.modalQuestion}>Are you sure to delete?</p>
            <p className={styles.modalName}>&ldquo;{deleteTarget.name}&rdquo;</p>
            <div className={styles.modalActions}>
              <button
                className={styles.cancelModalBtn}
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </button>
              <button className={styles.confirmDeleteBtn} onClick={handleDelete}>
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
