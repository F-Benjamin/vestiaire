"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/i18n/LocalizationProvider";
import { authClient } from "@/lib/auth-client";
import ProfileSection from "./ProfileSection";
import styles from "./ProfilePage.module.scss";

type ProfileIdentityProps = {
  email: string;
  initialName: string;
};

const ProfileIdentity = ({
  email,
  initialName,
}: ProfileIdentityProps) => {
  const router = useRouter();
  const { messages } = useI18n();
  const copy = messages.profile;
  const [name, setName] = useState(initialName);
  const [feedback, setFeedback] = useState("");
  const [hasError, setHasError] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback("");
    setHasError(false);
    setIsPending(true);

    try {
      const result = await authClient.updateUser({ name: name.trim() });

      if (result.error) {
        setHasError(true);
        setFeedback(copy.identityError);
        return;
      }

      setFeedback(copy.identitySaved);
      router.refresh();
    } catch {
      setHasError(true);
      setFeedback(copy.identityError);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <ProfileSection
      id="identity"
      title={copy.identityTitle}
      description={copy.identityDescription}
    >
      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.field}>
          <span>{copy.name}</span>
          <input
            name="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            type="text"
            autoComplete="name"
            minLength={2}
            maxLength={80}
            required
          />
        </label>

        <label className={styles.field}>
          <span>{copy.email}</span>
          <input value={email} type="email" readOnly aria-readonly="true" />
          <small>{copy.emailManaged}</small>
        </label>

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
            disabled={isPending || name.trim() === initialName}
          >
            {isPending ? copy.savingIdentity : copy.saveIdentity}
          </button>
        </div>
      </form>
    </ProfileSection>
  );
};

export default ProfileIdentity;
