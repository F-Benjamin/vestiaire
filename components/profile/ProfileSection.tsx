import type { ReactNode } from "react";
import styles from "./ProfilePage.module.scss";

type ProfileSectionProps = {
  children: ReactNode;
  description: string;
  id: string;
  title: string;
  tone?: "default" | "danger";
};

const ProfileSection = ({
  children,
  description,
  id,
  title,
  tone = "default",
}: ProfileSectionProps) => (
  <section
    className={`${styles.section} ${tone === "danger" ? styles.dangerSection : ""}`}
    id={id}
    aria-labelledby={`${id}-title`}
  >
    <div className={styles.sectionHeading}>
      <h2 id={`${id}-title`}>{title}</h2>
      <p>{description}</p>
    </div>
    <div className={styles.sectionContent}>{children}</div>
  </section>
);

export default ProfileSection;
