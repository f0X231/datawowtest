import styles from './AuthSidebar.module.css';

interface AuthSidebarProps {
  quote?: string;
  quoteBody?: string;
}

const DEFAULT_QUOTE = '“Powering the tools that power the team.”';
const DEFAULT_BODY =
  'Lorem ipsum dolor sit amet consectetur. Elit purus nam gravida porttitor nibh urna sit ornare a. Proin dolor morbi id ornare aenean non¡';

export default function AuthSidebar({
  quote = DEFAULT_QUOTE,
  quoteBody = DEFAULT_BODY,
}: AuthSidebarProps) {
  return (
    <div className={styles.sidebar}>
      <div className={styles.brand}>
        <div className={styles.brandCircle} />
        <span className={styles.brandName}>BRAND</span>
      </div>

      <div className={styles.footer}>
        <p className={styles.quote}>{quote}</p>
        <p className={styles.quoteBody}>{quoteBody}</p>
      </div>
    </div>
  );
}
