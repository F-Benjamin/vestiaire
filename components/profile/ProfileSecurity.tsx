"use client";

import { useState, type FormEvent } from "react";
import { useI18n } from "@/components/i18n/LocalizationProvider";
import { authClient } from "@/lib/auth-client";
import ProfileSection from "./ProfileSection";
import styles from "./ProfilePage.module.scss";

type PasswordVisibilityButtonProps = {
  isVisible: boolean;
  onClick: () => void;
  showLabel: string;
  hideLabel: string;
};

const PasswordVisibilityButton = ({
  isVisible,
  onClick,
  showLabel,
  hideLabel,
}: PasswordVisibilityButtonProps) => (
  <button
    className={styles.passwordVisibility}
    type="button"
    onClick={onClick}
    aria-pressed={isVisible}
    aria-label={isVisible ? hideLabel : showLabel}
    title={isVisible ? hideLabel : showLabel}
    data-visible={isVisible}
  >
    <span className={styles.eyeIcon} aria-hidden="true">
      <i />
    </span>
  </button>
);

type PasswordField = "current" | "new" | "confirmation";

const ProfileSecurity = () => {
  const { messages } = useI18n();
  const copy = messages.profile;
  const [feedback, setFeedback] = useState("");
  const [hasError, setHasError] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [visibleFields, setVisibleFields] = useState<Record<PasswordField, boolean>>({
    current: false,
    new: false,
    confirmation: false,
  });
  const togglePasswordVisibility = (field: PasswordField) => {
    setVisibleFields((current) => ({
      ...current,
      [field]: !current[field],
    }));
  };

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
        <div className={styles.field}>
          <label htmlFor="current-password">{copy.currentPassword}</label>
          <div className={styles.passwordInput}>
            <input
              id="current-password"
              name="currentPassword"
              type={visibleFields.current ? "text" : "password"}
              autoComplete="current-password"
              minLength={12}
              maxLength={128}
              required
            />
            <PasswordVisibilityButton
              isVisible={visibleFields.current}
              onClick={() => togglePasswordVisibility("current")}
              showLabel={copy.showPasswords}
              hideLabel={copy.hidePasswords}
            />
          </div>
        </div>

        <div className={styles.twoColumns}>
          <div className={styles.field}>
            <label htmlFor="new-password">{copy.newPassword}</label>
            <div className={styles.passwordInput}>
              <input
                id="new-password"
                name="newPassword"
                type={visibleFields.new ? "text" : "password"}
                autoComplete="new-password"
                minLength={12}
                maxLength={128}
                aria-describedby="profile-password-hint"
                required
              />
              <PasswordVisibilityButton
                isVisible={visibleFields.new}
                onClick={() => togglePasswordVisibility("new")}
                showLabel={copy.showPasswords}
                hideLabel={copy.hidePasswords}
              />
            </div>
            <small id="profile-password-hint">{copy.passwordHint}</small>
          </div>

          <div className={styles.field}>
            <label htmlFor="password-confirmation">
              {copy.confirmPassword}
            </label>
            <div className={styles.passwordInput}>
              <input
                id="password-confirmation"
                name="confirmation"
                type={visibleFields.confirmation ? "text" : "password"}
                autoComplete="new-password"
                minLength={12}
                maxLength={128}
                required
              />
              <PasswordVisibilityButton
                isVisible={visibleFields.confirmation}
                onClick={() => togglePasswordVisibility("confirmation")}
                showLabel={copy.showPasswords}
                hideLabel={copy.hidePasswords}
              />
            </div>
          </div>
        </div>

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
