"use client";

import { useRef, useState, type FormEvent } from "react";
import { useI18n } from "@/components/i18n/LocalizationProvider";
import { authClient } from "@/lib/auth-client";
import ProfileSection from "./ProfileSection";
import styles from "./ProfilePage.module.scss";

type ProfileDataProps = {
  email: string;
};

const ProfileData = ({ email }: ProfileDataProps) => {
  const { messages, href } = useI18n();
  const copy = messages.profile;
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [feedback, setFeedback] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const closeDialog = () => {
    if (!isDeleting) dialogRef.current?.close();
  };

  const handleDelete = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const confirmedEmail = String(formData.get("email") ?? "")
      .trim()
      .toLowerCase();

    setFeedback("");

    if (confirmedEmail !== email.toLowerCase()) {
      setFeedback(copy.confirmationMismatch);
      return;
    }

    setIsDeleting(true);

    try {
      const result = await authClient.deleteUser({
        password: String(formData.get("password") ?? ""),
        callbackURL: new URL(href(), window.location.origin).toString(),
      });

      if (result.error) {
        setFeedback(copy.deleteError);
        return;
      }

      window.location.assign(href());
    } catch {
      setFeedback(copy.deleteError);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <ProfileSection
        id="data"
        title={copy.dataTitle}
        description={copy.dataDescription}
      >
        <div className={styles.dataAction}>
          <div>
            <h3>{copy.exportTitle}</h3>
            <p>{copy.exportDescription}</p>
          </div>
          <a
            className={styles.secondaryButton}
            href="/api/account/export"
            download
          >
            {copy.exportAction}
          </a>
        </div>
      </ProfileSection>

      <ProfileSection
        id="danger"
        title={copy.dangerTitle}
        description={copy.dangerDescription}
        tone="danger"
      >
        <button
          className={styles.dangerButton}
          type="button"
          onClick={() => {
            setFeedback("");
            dialogRef.current?.showModal();
          }}
        >
          {copy.deleteAccount}
        </button>
      </ProfileSection>

      <dialog
        className={styles.dialog}
        ref={dialogRef}
        aria-labelledby="delete-account-title"
        onCancel={(event) => {
          if (isDeleting) event.preventDefault();
        }}
      >
        <form className={styles.dialogContent} onSubmit={handleDelete}>
          <div className={styles.dialogIcon} aria-hidden="true">
            !
          </div>
          <div>
            <h2 id="delete-account-title">{copy.deleteDialogTitle}</h2>
            <p>{copy.deleteDialogDescription}</p>
          </div>

          <label className={styles.field}>
            <span>{copy.confirmEmail}</span>
            <input
              name="email"
              type="email"
              autoComplete="off"
              placeholder={email}
              required
            />
          </label>

          <label className={styles.field}>
            <span>{copy.deletePassword}</span>
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              minLength={12}
              maxLength={128}
              required
            />
          </label>

          {feedback && (
            <p className={styles.error} role="alert">
              {feedback}
            </p>
          )}

          <div className={styles.dialogActions}>
            <button
              className={styles.secondaryButton}
              type="button"
              disabled={isDeleting}
              onClick={closeDialog}
            >
              {copy.cancel}
            </button>
            <button
              className={styles.dangerButton}
              type="submit"
              disabled={isDeleting}
            >
              {isDeleting ? copy.deletingAccount : copy.confirmDelete}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
};

export default ProfileData;
