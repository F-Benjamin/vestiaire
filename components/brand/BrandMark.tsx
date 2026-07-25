import Link from "next/link";
import styles from "./BrandMark.module.scss";

type BrandMarkProps = {
  homeLabel: string;
  href: string;
  priority?: "primary" | "quiet";
};

const BrandMark = ({
  homeLabel,
  href,
  priority = "primary",
}: BrandMarkProps) => (
  <Link
    className={styles.brand}
    data-priority={priority}
    href={href}
    aria-label={homeLabel}
  >
    <span className={styles.symbol} aria-hidden="true">
      <i>w</i>
      <i>s</i>
    </span>
    <span className={styles.wordmark} aria-hidden="true">
      <span>wear</span>
      <em>sona</em>
    </span>
  </Link>
);

export default BrandMark;
