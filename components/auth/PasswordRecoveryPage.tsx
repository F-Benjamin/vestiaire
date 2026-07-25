"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import AuthShell from "@/components/auth/AuthShell";
import { useI18n } from "@/components/i18n/LocalizationProvider";
import { authClient } from "@/lib/auth-client";
import styles from "./AuthPage.module.scss";

type RecoveryMode = "forgot-password" | "reset-password";

type PasswordRecoveryPageProps = {
  emailAuthEnabled: boolean;
  invalidToken?: boolean;
  mode: RecoveryMode;
  token?: string;
};

const PasswordRecoveryPage = ({
  emailAuthEnabled,
  invalidToken = false,
  mode,
  token,
}: PasswordRecoveryPageProps) => {
  const { messages, href } = useI18n();
  const copy = messages.auth;
  const isForgotPassword = mode === "forgot-password";
  const [errorMessage, setErrorMessage] = useState(
    invalidToken || (!isForgotPassword && !token) ? copy.invalidResetLink : "",
  );
  const [isComplete, setIsComplete] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");

    if (!emailAuthEnabled) {
      setErrorMessage(copy.emailFeatureUnavailable);
      return;
    }

    setIsPending(true);
    const formData = new FormData(event.currentTarget);

    try {
      if (isForgotPassword) {
        const email = String(formData.get("email") ?? "")
          .trim()
          .toLowerCase();
        const redirectTo = new URL(
          href("/reset-password"),
          window.location.origin,
        ).toString();
        await authClient.requestPasswordReset({ email, redirectTo });
        setIsComplete(true);
        return;
      }

      const newPassword = String(formData.get("newPassword") ?? "");
      const confirmation = String(formData.get("confirmation") ?? "");

      if (newPassword !== confirmation) {
        setErrorMessage(copy.passwordsDoNotMatch);
        return;
      }

      if (!token) {
        setErrorMessage(copy.invalidResetLink);
        return;
      }

      const result = await authClient.resetPassword({ newPassword, token });
      if (result.error) {
        setErrorMessage(copy.invalidResetLink);
        return;
      }

      setIsComplete(true);
    } catch {
      setErrorMessage(copy.genericError);
    } finally {
      setIsPending(false);
    }
  };

  const eyebrow = isForgotPassword
    ? copy.forgotPasswordEyebrow
    : copy.resetPasswordEyebrow;
  const title = isForgotPassword
    ? copy.forgotPasswordTitle
    : copy.resetPasswordTitle;
  const intro = isForgotPassword
    ? copy.forgotPasswordIntro
    : copy.resetPasswordIntro;
  const panelTitle = isForgotPassword
    ? copy.sendResetLink
    : copy.resetPassword;

  return (
    <AuthShell
      eyebrow={eyebrow}
      title={title}
      intro={intro}
      panelTitle={panelTitle}
    >
      {isComplete ? (
        <>
          <p className={styles.success} role="status">
            {isForgotPassword ? copy.resetRequestSent : copy.passwordReset}
          </p>
          <p className={styles.switchMode}>
            <Link href={href("/sign-in")}>{copy.backToSignIn}</Link>
          </p>
        </>
      ) : (
        <>
          {!emailAuthEnabled && (
            <p className={styles.error} role="alert">
              {copy.emailFeatureUnavailable}
            </p>
          )}

          {errorMessage && (
            <p className={styles.error} role="alert">
              {errorMessage}
            </p>
          )}

          <form className={styles.form} onSubmit={handleSubmit}>
            {isForgotPassword ? (
              <label>
                <span>{copy.email}</span>
                <input
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder={copy.emailPlaceholder}
                  maxLength={254}
                  required
                />
              </label>
            ) : (
              <>
                <label>
                  <span>{copy.newPassword}</span>
                  <input
                    name="newPassword"
                    type="password"
                    autoComplete="new-password"
                    minLength={12}
                    maxLength={128}
                    aria-describedby="password-hint"
                    required
                  />
                  <small id="password-hint">{copy.passwordHint}</small>
                </label>
                <label>
                  <span>{copy.confirmPassword}</span>
                  <input
                    name="confirmation"
                    type="password"
                    autoComplete="new-password"
                    minLength={12}
                    maxLength={128}
                    required
                  />
                </label>
              </>
            )}

            <button
              className={styles.submit}
              type="submit"
              disabled={
                isPending ||
                !emailAuthEnabled ||
                (!isForgotPassword && (!token || invalidToken))
              }
            >
              {isPending
                ? isForgotPassword
                  ? copy.sendingResetLink
                  : copy.resettingPassword
                : panelTitle}
              <span aria-hidden="true">→</span>
            </button>
          </form>

          <p className={styles.switchMode}>
            <Link href={href("/sign-in")}>{copy.backToSignIn}</Link>
          </p>
          <p className={styles.privacy}>{copy.privacyNote}</p>
        </>
      )}
    </AuthShell>
  );
};

export default PasswordRecoveryPage;
