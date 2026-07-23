import { useI18n } from "@/components/i18n/LocalizationProvider";
import { getAttributeLabel } from "@/i18n/format";
import { useWardrobe } from "./WardrobeContext";
import type {
  AttributeKey,
  WardrobeItem,
} from "./wardrobe.types";
import styles from "./MultiField.module.scss";

type MultiFieldProps<K extends AttributeKey> = {
  label: string;
  item: WardrobeItem;
  field: K;
  values: readonly WardrobeItem[K][number][];
};

const MultiField = <K extends AttributeKey,>({
  label,
  item,
  field,
  values,
}: MultiFieldProps<K>) => {
  const { toggleAttribute } = useWardrobe();
  const { messages } = useI18n();

  return (
    <fieldset className={styles.root}>
      <legend>{label}</legend>
      <div className={styles.chips}>
        {values.map((value) => (
          <button
            type="button"
            key={String(value)}
            className={
              (item[field] as WardrobeItem[K][number][]).includes(value)
                ? styles.active
                : undefined
            }
            aria-pressed={(item[field] as WardrobeItem[K][number][]).includes(
              value,
            )}
            onClick={() => toggleAttribute(item.id, field, value)}
          >
            {getAttributeLabel(messages, field, String(value))}
          </button>
        ))}
      </div>
    </fieldset>
  );
};

export default MultiField;
