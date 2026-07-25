import { useI18n } from "@/components/i18n/LocalizationProvider";
import { useWardrobe } from "./WardrobeContext";
import styles from "./UploadButton.module.scss";

type UploadButtonProps = {
  large?: boolean;
};

const UploadButton = ({ large = false }: UploadButtonProps) => {
  const { importPhotos, isUploading } = useWardrobe();
  const { messages } = useI18n();

  return (
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
  );
};

export default UploadButton;
