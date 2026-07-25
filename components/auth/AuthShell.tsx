"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import LocaleSwitcher from "@/components/i18n/LocaleSwitcher";
import { useI18n } from "@/components/i18n/LocalizationProvider";
import ThemeSwitcher from "@/components/theme/ThemeSwitcher";
import styles from "./AuthPage.module.scss";

type AuthShellProps = {
  children: ReactNode;
  eyebrow: string;
  intro: string;
  panelTitle: string;
  title: string;
};

const AuthShell = ({
  children,
  eyebrow,
  intro,
  panelTitle,
  title,
}: AuthShellProps) => {
  const { messages, href } = useI18n();

  return (
    <>
      <a className={styles.skipLink} href="#main-content">
        {messages.common.skipToContent}
      </a>

      <header className={styles.header}>
        <Link
          className={styles.brand}
          href={href()}
          aria-label={messages.common.homeLabel}
        >
          <i aria-hidden="true">V</i>
          <span>{messages.common.brand}</span>
        </Link>
        <div className={styles.headerActions}>
          <LocaleSwitcher />
          <ThemeSwitcher />
        </div>
      </header>

      <main className={styles.main} id="main-content" tabIndex={-1}>
        <section className={styles.introduction}>
          <p className={styles.eyebrow}>{eyebrow}</p>
          <h1>{title}</h1>
          <p>{intro}</p>
          <div className={styles.decorativeCard} aria-hidden="true">
            <span>V</span>
            <div>
              <i />
              <i />
              <i />
            </div>
          </div>
        </section>

        <section
          className={styles.formPanel}
          aria-labelledby="authentication-title"
        >
          <div className={styles.formHeading}>
            <p>{messages.common.brand}</p>
            <h2 id="authentication-title">{panelTitle}</h2>
          </div>
          {children}
        </section>
      </main>
    </>
  );
};

export default AuthShell;
