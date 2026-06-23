'use client';

import { useState } from 'react';
import styles from './page.module.css';

function PersonIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

type Concert = {
  id: number;
  name: string;
  description: string;
  seats: number;
  reserved: boolean;
};

const LOREM_LONG =
  'Lorem ipsum dolor sit amet consectetur. Elit purus nam gravida porttitor nibh urna sit ornare a. Proin dolor morbi id ornare aenean non. Fusce dignissim turpis sed non est orci sed in. Blandit ut purus nunc sed donec commodo morbi diam scelerisque.';

const INITIAL_CONCERTS: Concert[] = [
  { id: 1, name: 'Concert Name', description: LOREM_LONG, seats: 500, reserved: true },
  { id: 2, name: 'Concert Name', description: LOREM_LONG, seats: 2000, reserved: false },
];

export default function UserHomePage() {
  const [concerts, setConcerts] = useState<Concert[]>(INITIAL_CONCERTS);

  const toggleReserve = (id: number) => {
    setConcerts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, reserved: !c.reserved } : c))
    );
  };

  return (
    <div className={styles.concertList}>
      {concerts.map((concert) => (
        <div key={concert.id} className={styles.concertCard}>
          <h2 className={styles.concertName}>{concert.name}</h2>
          <hr className={styles.divider} />
          <p className={styles.concertDesc}>{concert.description}</p>
          <div className={styles.concertFooter}>
            <span className={styles.seatCount}>
              <PersonIcon className={styles.seatIcon} />
              {concert.seats.toLocaleString()}
            </span>
            {concert.reserved ? (
              <button
                className={styles.cancelBtn}
                onClick={() => toggleReserve(concert.id)}
              >
                Cancel
              </button>
            ) : (
              <button
                className={styles.reserveBtn}
                onClick={() => toggleReserve(concert.id)}
              >
                Reserve
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
