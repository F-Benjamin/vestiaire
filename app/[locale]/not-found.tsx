"use client";

import Link from "next/link";
import { useI18n } from "@/components/i18n/LocalizationProvider";
import styles from "./RouteState.module.scss";

const NotFound = () => {
  const { messages, href } = useI18n();

  return (
    <main className={styles.root}>
      <span>404</span>
      <h1>{messages.routeState.notFound}</h1>
      <Link className={styles.action} href={href()}>
        {messages.routeState.backHome}
      </Link>
    </main>
  );
};

export default NotFound;
