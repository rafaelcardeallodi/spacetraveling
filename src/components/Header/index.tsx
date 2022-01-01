import Link from 'next/link';

import styles from './header.module.scss';

export default function Header() {
  return (
    <header>
      <div className={styles.headerContent}>
        <Link href="/">
          <img src="/images/logo.svg" alt="logo" />
        </Link>
      </div>
    </header>
  );
}
