"use client";

import { useState, type FormEvent } from "react";
import { useI18n } from "@/components/i18n/LocalizationProvider";
import { authClient } from "@/lib/auth-client";
import ProfileSection from "./ProfileSection";
import styles from "./ProfilePage.module.scss";

const ProfileSecurity = () => {
  const { messages } = useI18n();
  const copy = messages.profile;
  const [feedback, setFeedback] = useState("");
  const [hasError, setHasError] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const currentPassword = String(formData.get("currentPassword") ?? "");
    const newPassword = String(formData.get("newPassword") ?? "");
    const confirmation = String(formData.get("confirmation") ?? "");

    setFeedback("");
    setHasError(false);

    if (newPassword !== confirmation) {
      setHasError(true);
      setFeedback(copy.passwordMismatch);
      return;
    }

    setIsPending(true);

    try {
      const result = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      });

      if (result.error) {
        setHasError(true);
        setFeedback(
          Number(result.error.status) === 400
            ? copy.currentPasswordInvalid
            : copy.passwordError,
        );
        return;
      }

      form.reset();
      setFeedback(copy.passwordChanged);
      window.dispatchEvent(new Event("vestiaire:sessions-changed"));
    } catch {
      setHasError(true);
      setFeedback(copy.passwordError);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <ProfileSection
      id="security"
      title={copy.passwordTitle}
      description={copy.passwordDescription}
    >
      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.field}>
          <span>{copy.currentPassword}</span>
          <input
            name="currentPassword"
            type={showPasswords ? "text" : "password"}
            autoComplete="current-password"
            minLength={12}
            maxLength={128}
            required
          />
        </label>

        <div className={styles.twoColumns}>
          <label className={styles.field}>
            <span>{copy.newPassword}</span>
            <input
              name="newPassword"
              type={showPasswords ? "text" : "password"}
              autoComplete="new-password"
              minLength={12}
              maxLength={128}
              aria-describedby="profile-password-hint"
              required
            />
            <small id="profile-password-hint">{copy.passwordHint}</small>
          </label>

          <label className={styles.field}>
            <span>{copy.confirmPassword}</span>
            <input
              name="confirmation"
              type={showPasswords ? "text" : "password"}
              autoComplete="new-password"
              minLength={12}
              maxLength={128}
              required
            />
          </label>
        </div>

        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={showPasswords}
            onChange={(event) => setShowPasswords(event.target.checked)}
          />
          <span>
            {showPasswords ? copy.hidePasswords : copy.showPasswords}
          </span>
        </label>

        <p className={styles.securityNote}>
          {copy.revokeOtherSessionsAfterChange}
        </p>

        {feedback && (
          <p
            className={hasError ? styles.error : styles.success}
            role={hasError ? "alert" : "status"}
          >
            {feedback}
          </p>
        )}

        <div className={styles.formActions}>
          <button
            className={styles.primaryButton}
            type="submit"
            disabled={isPending}
          >
            {isPending ? copy.changingPassword : copy.changePassword}
          </button>
        </div>
      </form>
    </ProfileSection>
  );
};

export default ProfileSecurity;
