"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import BrandMark from "@/components/brand/BrandMark";
import LocaleSwitcher from "@/components/i18n/LocaleSwitcher";
import { useI18n } from "@/components/i18n/LocalizationProvider";
import ThemeSwitcher from "@/components/theme/ThemeSwitcher";
import { formatMessage } from "@/i18n/format";
import { authClient } from "@/lib/auth-client";
import { useWardrobe } from "./WardrobeContext";
import UploadButton from "./UploadButton";
import styles from "./AppHeader.module.scss";

type AppHeaderProps = {
  user: {
    name: string;
  } | null;
};

const AppHeader = ({ user }: AppHeaderProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const { notice, setNotice } = useWardrobe();
  const { messages, href } = useI18n();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const wardrobeHref = href("/wardrobe");
  const studioHref = href("/studio");
  const profileHref = href("/profile");

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      const result = await authClient.signOut();
      if (result.error) return;
      router.replace(href());
      router.refresh();
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <>
      <a className={styles.skipLink} href="#main-content">
        {messages.common.skipToContent}
      </a>
      <header className={styles.topbar}>
        <BrandMark
          homeLabel={messages.common.homeLabel}
          href={href()}
          priority="quiet"
        />
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
          {user && (
            <div className={styles.account}>
              <Link
                className={
                  pathname.startsWith(profileHref)
                    ? styles.activeAccount
                    : undefined
                }
                href={profileHref}
                title={messages.common.profile}
                aria-label={formatMessage(messages.common.account, {
                  name: user.name,
                })}
                aria-current={
                  pathname.startsWith(profileHref) ? "page" : undefined
                }
              >
                {user.name.slice(0, 1).toLocaleUpperCase()}
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                disabled={isSigningOut}
                aria-label={messages.common.signOut}
              >
                <span>{messages.common.signOut}</span>
              </button>
            </div>
          )}
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
