"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthShell from "@/components/auth/AuthShell";
import { useI18n } from "@/components/i18n/LocalizationProvider";
import { authClient } from "@/lib/auth-client";
import styles from "./AuthPage.module.scss";

type AuthMode = "sign-in" | "sign-up";

type AuthPageProps = {
  callbackUrl?: string;
  emailAuthEnabled: boolean;
  mode: AuthMode;
  registered?: boolean;
  verified?: boolean;
};

const AuthPage = ({
  callbackUrl,
  emailAuthEnabled,
  mode,
  registered = false,
  verified = false,
}: AuthPageProps) => {
  const router = useRouter();
  const { messages, href } = useI18n();
  const [errorMessage, setErrorMessage] = useState("");
  const [isPending, setIsPending] = useState(false);
  const isSignIn = mode === "sign-in";
  const copy = messages.auth;
  const destination = callbackUrl ?? href("/wardrobe");
  const alternatePath = href(isSignIn ? "/sign-up" : "/sign-in");
  const alternateHref = callbackUrl
    ? `${alternatePath}?callbackUrl=${encodeURIComponent(callbackUrl)}`
    : alternatePath;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setIsPending(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const password = String(formData.get("password") ?? "");

    try {
      if (isSignIn) {
        const result = await authClient.signIn.email({
          email,
          password,
          rememberMe: formData.get("rememberMe") === "on",
        });

        if (result.error) {
          setErrorMessage(
            emailAuthEnabled && Number(result.error.status) === 403
              ? copy.emailNotVerified
              : copy.invalidCredentials,
          );
          return;
        }

        router.replace(destination);
        router.refresh();
        return;
      }

      const result = await authClient.signUp.email({
        name: String(formData.get("name") ?? "").trim(),
        email,
        password,
        callbackURL: (() => {
          const verificationCallback = new URL(
            href("/sign-in"),
            window.location.origin,
          );
          verificationCallback.searchParams.set("verified", "1");
          if (callbackUrl) {
            verificationCallback.searchParams.set("callbackUrl", callbackUrl);
          }
          return verificationCallback.toString();
        })(),
      });

      if (result.error) {
        setErrorMessage(copy.signUpFailed);
        return;
      }

      const signInQuery = new URLSearchParams({ registered: "1" });
      if (callbackUrl) signInQuery.set("callbackUrl", callbackUrl);
      router.replace(`${href("/sign-in")}?${signInQuery.toString()}`);
      router.refresh();
    } catch {
      setErrorMessage(copy.genericError);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <AuthShell
      eyebrow={isSignIn ? copy.signInEyebrow : copy.signUpEyebrow}
      title={isSignIn ? copy.signInTitle : copy.signUpTitle}
      intro={isSignIn ? copy.signInIntro : copy.signUpIntro}
      panelTitle={isSignIn ? copy.submitSignIn : copy.submitSignUp}
    >
      {registered && (
        <p className={styles.success} role="status">
          {emailAuthEnabled
            ? copy.registered
            : copy.registeredWithoutVerification}
        </p>
      )}

      {verified && (
        <p className={styles.success} role="status">
          {copy.emailVerified}
        </p>
      )}

      {errorMessage && (
        <p className={styles.error} role="alert">
          {errorMessage}
        </p>
      )}

      <form className={styles.form} onSubmit={handleSubmit}>
        {!isSignIn && (
          <label>
            <span>{copy.name}</span>
            <input
              name="name"
              type="text"
              autoComplete="name"
              placeholder={copy.namePlaceholder}
              minLength={2}
              maxLength={80}
              required
            />
          </label>
        )}

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

        <label>
          <span>{copy.password}</span>
          <input
            name="password"
            type="password"
            autoComplete={isSignIn ? "current-password" : "new-password"}
            minLength={12}
            maxLength={128}
            aria-describedby={!isSignIn ? "password-hint" : undefined}
            required
          />
          {!isSignIn && (
            <small id="password-hint">{copy.passwordHint}</small>
          )}
        </label>

        {isSignIn && (
          <div className={styles.signInOptions}>
            <label className={styles.checkbox}>
              <input name="rememberMe" type="checkbox" defaultChecked />
              <span>{copy.rememberMe}</span>
            </label>
            {emailAuthEnabled && (
              <Link href={href("/forgot-password")}>
                {copy.forgotPassword}
              </Link>
            )}
          </div>
        )}

        <button className={styles.submit} type="submit" disabled={isPending}>
          {isPending
            ? isSignIn
              ? copy.submittingSignIn
              : copy.submittingSignUp
            : isSignIn
              ? copy.submitSignIn
              : copy.submitSignUp}
          <span aria-hidden="true">→</span>
        </button>
      </form>

      <p className={styles.switchMode}>
        {isSignIn ? copy.noAccount : copy.alreadyAccount}{" "}
        <Link href={alternateHref}>
          {isSignIn ? copy.createAccount : copy.goToSignIn}
        </Link>
      </p>
      <p className={styles.privacy}>{copy.privacyNote}</p>
    </AuthShell>
  );
};

export default AuthPage;
