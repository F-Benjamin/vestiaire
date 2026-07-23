"use client";

import { useI18n } from "@/components/i18n/LocalizationProvider";
import styles from "../RouteState.module.scss";

const WardrobeLoading = () => {
  const { messages } = useI18n();

  return (
    <section className={styles.root} aria-busy="true" aria-live="polite">
      <span>✦</span>
      <p>{messages.routeState.loading}</p>
    </section>
  );
};

export default WardrobeLoading;
