"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useI18n } from "@/components/i18n/LocalizationProvider";
import { formatMessage } from "@/i18n/format";
import { authClient } from "@/lib/auth-client";
import ProfileSection from "./ProfileSection";
import styles from "./ProfilePage.module.scss";

type ActiveSession = {
  createdAt: Date | string;
  expiresAt: Date | string;
  id: string;
  token: string;
  updatedAt: Date | string;
  userAgent?: string | null;
};

type DeviceDescription = {
  browser: string;
  device: string;
};

const describeDevice = (
  userAgent: string | null | undefined,
  fallback: {
    desktop: string;
    mobile: string;
    tablet: string;
    unknownBrowser: string;
    unknownDevice: string;
  },
): DeviceDescription => {
  if (!userAgent) {
    return {
      browser: fallback.unknownBrowser,
      device: fallback.unknownDevice,
    };
  }

  const browser = /Edg(?:e|A|iOS)?\//.test(userAgent)
    ? "Microsoft Edge"
    : /Firefox\/|FxiOS\//.test(userAgent)
      ? "Firefox"
      : /Chrome\/|CriOS\//.test(userAgent)
        ? "Chrome"
        : /Safari\//.test(userAgent)
          ? "Safari"
          : fallback.unknownBrowser;
  const device = /iPad|Tablet/.test(userAgent)
    ? fallback.tablet
    : /Mobile|iPhone|Android/.test(userAgent)
      ? fallback.mobile
      : fallback.desktop;

  return { browser, device };
};

const ProfileSessions = () => {
  const { locale, messages } = useI18n();
  const copy = messages.profile;
  const { data: currentSession, isPending: isSessionLoading } =
    authClient.useSession();
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [feedback, setFeedback] = useState("");
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [revokingToken, setRevokingToken] = useState("");
  const [isRevokingOthers, setIsRevokingOthers] = useState(false);
  const currentSessionId = currentSession?.session.id;
  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    [locale],
  );

  const loadSessions = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);

    try {
      const result = await authClient.listSessions();

      if (result.error) {
        setHasError(true);
        return;
      }

      setSessions(result.data ?? []);
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => void loadSessions(), 0);
    const handleSessionsChanged = () => void loadSessions();
    window.addEventListener("vestiaire:sessions-changed", handleSessionsChanged);

    return () => {
      window.clearTimeout(initialLoad);
      window.removeEventListener(
        "vestiaire:sessions-changed",
        handleSessionsChanged,
      );
    };
  }, [loadSessions]);

  const handleRevoke = async (token: string) => {
    setRevokingToken(token);
    setFeedback("");
    setHasError(false);

    try {
      const result = await authClient.revokeSession({ token });
      if (result.error) {
        setHasError(true);
        setFeedback(copy.sessionsError);
        return;
      }

      setFeedback(copy.sessionRevoked);
      await loadSessions();
    } catch {
      setHasError(true);
      setFeedback(copy.sessionsError);
    } finally {
      setRevokingToken("");
    }
  };

  const handleRevokeOthers = async () => {
    setIsRevokingOthers(true);
    setFeedback("");
    setHasError(false);

    try {
      const result = await authClient.revokeOtherSessions();
      if (result.error) {
        setHasError(true);
        setFeedback(copy.sessionsError);
        return;
      }

      setFeedback(copy.otherSessionsRevoked);
      await loadSessions();
    } catch {
      setHasError(true);
      setFeedback(copy.sessionsError);
    } finally {
      setIsRevokingOthers(false);
    }
  };

  const sortedSessions = [...sessions].sort((first, second) => {
    if (first.id === currentSessionId) return -1;
    if (second.id === currentSessionId) return 1;
    return (
      new Date(second.updatedAt).getTime() -
      new Date(first.updatedAt).getTime()
    );
  });
  const otherSessionCount = sessions.filter(
    (session) => session.id !== currentSessionId,
  ).length;

  return (
    <ProfileSection
      id="sessions"
      title={copy.sessionsTitle}
      description={copy.sessionsDescription}
    >
      {isLoading || isSessionLoading || !currentSessionId ? (
        <p className={styles.loadingState} role="status">
          {copy.loadingSessions}
        </p>
      ) : hasError && !sessions.length ? (
        <p className={styles.error} role="alert">
          {copy.sessionsError}
        </p>
      ) : (
        <div className={styles.sessionList}>
          {sortedSessions.map((session) => {
            const isCurrent = session.id === currentSessionId;
            const device = describeDevice(session.userAgent, copy);

            return (
              <article className={styles.sessionCard} key={session.id}>
                <div className={styles.deviceIcon} aria-hidden="true">
                  {device.device === copy.mobile ? "▯" : "□"}
                </div>
                <div className={styles.sessionDetails}>
                  <div className={styles.sessionTitle}>
                    <h3>
                      {device.browser} · {device.device}
                    </h3>
                    <span
                      className={
                        isCurrent ? styles.currentBadge : styles.sessionBadge
                      }
                    >
                      {isCurrent ? copy.currentSession : copy.otherSession}
                    </span>
                  </div>
                  <p>
                    {isCurrent
                      ? copy.activeNow
                      : formatMessage(copy.lastActive, {
                          date: dateFormatter.format(
                            new Date(session.updatedAt),
                          ),
                        })}
                  </p>
                  <small>
                    {formatMessage(copy.expiresOn, {
                      date: dateFormatter.format(new Date(session.expiresAt)),
                    })}
                  </small>
                </div>
                {!isCurrent && (
                  <button
                    className={styles.secondaryButton}
                    type="button"
                    disabled={revokingToken === session.token}
                    onClick={() => void handleRevoke(session.token)}
                  >
                    {revokingToken === session.token
                      ? copy.revokingSession
                      : copy.revokeSession}
                  </button>
                )}
              </article>
            );
          })}
        </div>
      )}

      {!isLoading && !isSessionLoading && !otherSessionCount && (
        <p className={styles.helperNote}>{copy.noOtherSessions}</p>
      )}

      {feedback && (
        <p
          className={hasError ? styles.error : styles.success}
          role={hasError ? "alert" : "status"}
        >
          {feedback}
        </p>
      )}

      {currentSessionId && otherSessionCount > 0 && (
        <div className={styles.formActions}>
          <button
            className={styles.secondaryButton}
            type="button"
            disabled={isRevokingOthers}
            onClick={() => void handleRevokeOthers()}
          >
            {isRevokingOthers
              ? copy.revokingOtherSessions
              : copy.revokeOtherSessions}
          </button>
        </div>
      )}
    </ProfileSection>
  );
};

export default ProfileSessions;
