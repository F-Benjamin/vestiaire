"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LocaleSwitcher from "@/components/i18n/LocaleSwitcher";
import { useI18n } from "@/components/i18n/LocalizationProvider";
import ThemeSwitcher from "@/components/theme/ThemeSwitcher";
import { useWardrobe } from "./WardrobeContext";
import UploadButton from "./UploadButton";
import styles from "./AppHeader.module.scss";

const AppHeader = () => {
  const pathname = usePathname();
  const { notice, setNotice } = useWardrobe();
  const { messages, href } = useI18n();
  const wardrobeHref = href("/wardrobe");
  const studioHref = href("/studio");

  return (
    <>
      <a className={styles.skipLink} href="#main-content">
        {messages.common.skipToContent}
      </a>
      <header className={styles.topbar}>
        <Link
          className={styles.brand}
          href={href()}
          aria-label={messages.common.homeLabel}
        >
          <i aria-hidden="true">V</i>
          <span>{messages.common.brand}</span>
        </Link>
        <nav
          className={styles.navigation}
          aria-label={messages.common.mainNavigation}
        >
          <Link
            className={
              pathname.startsWith(wardrobeHref) ? styles.active : undefined
            }
            href={wardrobeHref}
            aria-current={
              pathname.startsWith(wardrobeHref) ? "page" : undefined
            }
          >
            {messages.common.wardrobe}
          </Link>
          <Link
            className={
              pathname.startsWith(studioHref) ? styles.active : undefined
            }
            href={studioHref}
            aria-current={
              pathname.startsWith(studioHref) ? "page" : undefined
            }
          >
            {messages.common.studio}
          </Link>
        </nav>
        <div className={styles.actions}>
          <LocaleSwitcher />
          <ThemeSwitcher />
          <UploadButton />
        </div>
      </header>

      {notice && (
        <div className={styles.notice} role="status">
          {notice}
          <button
            onClick={() => setNotice("")}
            aria-label={messages.common.close}
          >
            ×
          </button>
        </div>
      )}
    </>
  );
};

export default AppHeader;
