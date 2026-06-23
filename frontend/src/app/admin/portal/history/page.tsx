import styles from './page.module.css';

const HISTORY_DATA = [
  {
    datetime: '12/09/2024 15:00:00',
    username: 'Sara John',
    concert: 'The festival Int 2024',
    action: 'Cancel',
  },
  {
    datetime: '12/09/2024 10:39:20',
    username: 'Sara John',
    concert: 'The festival Int 2024',
    action: 'Reserve',
  },
];

export default function AdminHistoryPage() {
  return (
    <div className={styles.tableWrap}>
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
          {HISTORY_DATA.map((row, i) => (
            <tr key={i}>
              <td>{row.datetime}</td>
              <td>{row.username}</td>
              <td>{row.concert}</td>
              <td>{row.action}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
