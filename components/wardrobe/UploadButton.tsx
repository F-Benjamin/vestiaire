import { useI18n } from "@/components/i18n/LocalizationProvider";
import { useWardrobe } from "./WardrobeContext";
import styles from "./UploadButton.module.scss";

type UploadButtonProps = {
  large?: boolean;
};

const UploadButton = ({ large = false }: UploadButtonProps) => {
  const { importPhotos } = useWardrobe();
  const { messages } = useI18n();

  return (
    <label className={`${styles.root} ${large ? styles.large : ""}`}>
      <input
        className="visually-hidden"
        type="file"
        accept="image/*"
        multiple
        onChange={importPhotos}
        aria-label={messages.upload.ariaLabel}
      />
      <span aria-hidden="true">＋</span>
      <span className={styles.label}>
        {large ? messages.upload.choosePhotos : messages.upload.addItems}
      </span>
    </label>
  );
};

export default UploadButton;
