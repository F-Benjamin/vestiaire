"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LocaleSwitcher from "@/components/i18n/LocaleSwitcher";
import { useI18n } from "@/components/i18n/LocalizationProvider";
import ThemeSwitcher from "@/components/theme/ThemeSwitcher";
import { authClient } from "@/lib/auth-client";
import styles from "./AuthPage.module.scss";

type AuthMode = "sign-in" | "sign-up";

type AuthPageProps = {
  callbackUrl?: string;
  mode: AuthMode;
  registered?: boolean;
};

const AuthPage = ({
  callbackUrl,
  mode,
  registered = false,
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
          setErrorMessage(copy.invalidCredentials);
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
          <p className={styles.eyebrow}>
            {isSignIn ? copy.signInEyebrow : copy.signUpEyebrow}
          </p>
          <h1>{isSignIn ? copy.signInTitle : copy.signUpTitle}</h1>
          <p>{isSignIn ? copy.signInIntro : copy.signUpIntro}</p>
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
            <h2 id="authentication-title">
              {isSignIn ? copy.submitSignIn : copy.submitSignUp}
            </h2>
          </div>

          {registered && (
            <p className={styles.success} role="status">
              {copy.registered}
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
              <label className={styles.checkbox}>
                <input name="rememberMe" type="checkbox" defaultChecked />
                <span>{copy.rememberMe}</span>
              </label>
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
        </section>
      </main>
    </>
  );
};

export default AuthPage;
