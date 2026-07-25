import type { Messages } from "@/i18n/dictionaries/fr";
import { formatMessage } from "@/i18n/format";
import type { Locale } from "@/i18n/routing";
import ProfileData from "./ProfileData";
import ProfileIdentity from "./ProfileIdentity";
import ProfilePreferences from "./ProfilePreferences";
import ProfileSecurity from "./ProfileSecurity";
import ProfileSessions from "./ProfileSessions";
import styles from "./ProfilePage.module.scss";

type ProfilePageProps = {
  copy: Messages["profile"];
  garmentCount: number;
  imageCount: number;
  locale: Locale;
  user: {
    createdAt: string;
    email: string;
    emailVerified: boolean;
    name: string;
  };
};

const ProfilePage = ({
  copy,
  garmentCount,
  imageCount,
  locale,
  user,
}: ProfilePageProps) => {
  const memberSince = new Intl.DateTimeFormat(locale, {
    dateStyle: "long",
  }).format(new Date(user.createdAt));
  const initials = user.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toLocaleUpperCase(locale))
    .join("");
  const navigation = [
    { href: "#identity", label: copy.overview },
    { href: "#preferences", label: copy.preferences },
    { href: "#security", label: copy.security },
    { href: "#sessions", label: copy.sessions },
    { href: "#data", label: copy.data },
  ];

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>{copy.eyebrow}</p>
          <h1>{copy.title}</h1>
          <p className={styles.intro}>{copy.intro}</p>
        </div>
        <div className={styles.profileSummary}>
          <div className={styles.avatar} aria-hidden="true">
            {initials || "V"}
          </div>
          <div>
            <h2>{user.name}</h2>
            <p>{user.email}</p>
            <div className={styles.profileMeta}>
              <span
                className={
                  user.emailVerified
                    ? styles.verifiedBadge
                    : styles.unverifiedBadge
                }
              >
                {user.emailVerified ? copy.verified : copy.unverified}
              </span>
              <span>
                {formatMessage(copy.memberSince, { date: memberSince })}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div
        className={styles.stats}
        role="group"
        aria-label={copy.wardrobeSummary}
      >
        <div>
          <strong>{garmentCount}</strong>
          <span>
            {garmentCount === 1
              ? copy.garmentCountOne
              : copy.garmentCountMany}
          </span>
        </div>
        <div>
          <strong>{imageCount}</strong>
          <span>
            {imageCount === 1 ? copy.imageCountOne : copy.imageCountMany}
          </span>
        </div>
      </div>

      <div className={styles.contentLayout}>
        <nav
          className={styles.sideNavigation}
          aria-label={copy.overviewNavigation}
        >
          {navigation.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className={styles.sections}>
          <ProfileIdentity initialName={user.name} email={user.email} />
          <ProfilePreferences />
          <ProfileSecurity />
          <ProfileSessions />
          <ProfileData email={user.email} />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
