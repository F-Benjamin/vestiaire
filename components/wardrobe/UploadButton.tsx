import { useI18n } from "@/components/i18n/LocalizationProvider";
import { formatMessage } from "@/i18n/format";
import { useWardrobe } from "./WardrobeContext";
import styles from "./UploadButton.module.scss";

type UploadButtonProps = {
  large?: boolean;
};

const UploadButton = ({ large = false }: UploadButtonProps) => {
  const { importPhotos, isUploading, uploadProgress } = useWardrobe();
  const { messages } = useI18n();

  const progressMessage = uploadProgress
    ? formatMessage(
        messages.upload[
          `${uploadProgress.step}Step` as keyof typeof messages.upload
        ] as string,
        uploadProgress,
      )
    : null;

  return (
    <div className={styles.container}>
      <label
        className={`${styles.root} ${large ? styles.large : ""} ${
          isUploading ? styles.disabled : ""
        }`}
        aria-busy={isUploading}
      >
      <input
        className="visually-hidden"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        disabled={isUploading}
        onChange={importPhotos}
        aria-label={messages.upload.ariaLabel}
      />
      <span aria-hidden="true">{isUploading ? "…" : "＋"}</span>
      <span className={styles.label}>
        {isUploading
          ? messages.upload.uploading
          : large
            ? messages.upload.choosePhotos
            : messages.upload.addItems}
      </span>
      </label>
      {progressMessage ? (
        <span className={styles.progress} role="status" aria-live="polite">
          {progressMessage}
        </span>
      ) : null}
    </div>
  );
};

export default UploadButton;
