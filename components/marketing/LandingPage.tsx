import Link from "next/link";
import BrandMark from "@/components/brand/BrandMark";
import LocaleSwitcher from "@/components/i18n/LocaleSwitcher";
import ThemeSwitcher from "@/components/theme/ThemeSwitcher";
import type { Messages } from "@/i18n/dictionaries/fr";
import { localizePath, type Locale } from "@/i18n/routing";
import styles from "./LandingPage.module.scss";

type LandingPageProps = {
  isAuthenticated: boolean;
  locale: Locale;
  messages: Messages;
};

const LandingPage = ({
  isAuthenticated,
  locale,
  messages,
}: LandingPageProps) => {
  const { common, landing } = messages;
  const homeHref = localizePath(locale);
  const wardrobeHref = localizePath(locale, "/wardrobe");
  const headerCtaHref = isAuthenticated
    ? wardrobeHref
    : localizePath(locale, "/sign-in");

  return (
    <>
      <a className={styles.skipLink} href="#main-content">
        {common.skipToContent}
      </a>

      <header className={styles.header}>
        <BrandMark homeLabel={common.homeLabel} href={homeHref} />

        <nav className={styles.navigation} aria-label={common.publicNavigation}>
          <a href="#concept">{landing.navigation.concept}</a>
          <a href="#vision">{landing.navigation.vision}</a>
        </nav>

        <div className={styles.actions}>
          <LocaleSwitcher />
          <ThemeSwitcher />
          <Link className={styles.headerCta} href={headerCtaHref}>
            {isAuthenticated ? landing.openPrototype : common.signIn}
          </Link>
        </div>
      </header>

      <main id="main-content" tabIndex={-1}>
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>{landing.heroEyebrow}</p>
            <h1>{landing.heroTitle}</h1>
            <p className={styles.intro}>{landing.heroIntro}</p>
            <div className={styles.heroActions}>
              <Link className={styles.primaryCta} href={headerCtaHref}>
                {landing.discoverPrototype} <span aria-hidden="true">→</span>
              </Link>
              <a className={styles.secondaryCta} href="#concept">
                {landing.understandConcept}
              </a>
            </div>
            <p className={styles.localNote}>{landing.localNote}</p>
          </div>

          <div className={styles.heroVisual} aria-hidden="true">
            <div className={styles.visualHeader}>
              <span>{landing.dailySuggestion}</span>
              <b>{landing.casual}</b>
            </div>
            <div className={styles.personaCanvas}>
              <div className={styles.personaType}>
                <span>today,</span>
                <strong>I am</strong>
                <em>{landing.casual}</em>
              </div>
              <div className={styles.lookRail}>
                <div className={`${styles.garment} ${styles.garmentTop}`}>
                  <span>{landing.shirt}</span>
                </div>
                <div className={`${styles.garment} ${styles.garmentLayer}`}>
                  <span>{landing.jacket}</span>
                </div>
                <div className={`${styles.garment} ${styles.garmentBottom}`}>
                  <span>{landing.trousers}</span>
                </div>
              </div>
            </div>
            <div className={styles.visualFooter}>
              <span>{landing.threePieces}</span>
              <i>✦</i>
            </div>
          </div>
        </section>

        <section className={styles.concept} id="concept">
          <div className={styles.sectionHeading}>
            <p className={styles.eyebrow}>{landing.conceptEyebrow}</p>
            <h2>{landing.conceptTitle}</h2>
          </div>

          <div className={styles.pillarGrid}>
            {landing.pillars.map((pillar) => (
              <article className={styles.pillar} key={pillar.number}>
                <span>{pillar.number}</span>
                <h3>{pillar.title}</h3>
                <p>{pillar.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.vision} id="vision">
          <div>
            <p className={styles.eyebrow}>{landing.visionEyebrow}</p>
            <h2>{landing.visionTitle}</h2>
          </div>
          <div className={styles.visionCopy}>
            <p>{landing.visionDescription}</p>
            <ul aria-label={landing.visionListLabel}>
              {landing.visionItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <Link className={styles.textLink} href={wardrobeHref}>
              {landing.exploreCurrentVersion} <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <BrandMark
          homeLabel={common.homeLabel}
          href={homeHref}
          priority="quiet"
        />
        <p>{landing.footerDescription}</p>
        <Link href={headerCtaHref}>{landing.accessApplication}</Link>
      </footer>
    </>
  );
};

export default LandingPage;
