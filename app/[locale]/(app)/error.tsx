"use client";

import { useI18n } from "@/components/i18n/LocalizationProvider";
import styles from "../RouteState.module.scss";

type WardrobeErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

const WardrobeError = ({ error, reset }: WardrobeErrorProps) => {
  const { messages } = useI18n();

  return (
    <section className={styles.root} role="alert">
      <span>!</span>
      <h1>{messages.routeState.errorTitle}</h1>
      <p>{error.message || messages.routeState.errorFallback}</p>
      <button className={styles.action} onClick={reset}>
        {messages.routeState.retry}
      </button>
    </section>
  );
};

export default WardrobeError;
