"use client";

/* Les images sont des fichiers locaux en Base64 : next/image ne peut pas les optimiser. */
/* eslint-disable @next/next/no-img-element */

import { useRouter } from "next/navigation";
import { useI18n } from "@/components/i18n/LocalizationProvider";
import {
  formatMessage,
  getCategoryLabel,
} from "@/i18n/format";
import {
  categories,
  colors,
  neutralColors,
  patterns,
  seasons,
  wardrobeStyles,
} from "./wardrobe.constants";
import { useWardrobe } from "./WardrobeContext";
import type { Category } from "./wardrobe.types";
import MultiField from "./MultiField";
import styles from "./StudioView.module.scss";

type StudioViewProps = {
  requestedItemId?: string;
};

const StudioView = ({ requestedItemId }: StudioViewProps) => {
  const {
    items,
    selectedId,
    setSelectedId,
    wantedStyle,
    setWantedStyle,
    outfit,
    updateItem,
    createOutfit,
  } = useWardrobe();
  const { locale, messages, href } = useI18n();
  const copy = messages.studio;
  const router = useRouter();
  const selected =
    items.find((item) => item.id === requestedItemId) ??
    items.find((item) => item.id === selectedId) ??
    items[0];

  const selectItem = (itemId: string) => {
    setSelectedId(itemId);
    router.replace(`${href("/studio")}?piece=${encodeURIComponent(itemId)}`, {
      scroll: false,
    });
  };

  return (
    <section className={styles.studio}>
      <div className={styles.head}>
        <p className={styles.eyebrow}>{copy.eyebrow}</p>
        <h1>{copy.title}</h1>
        <p>{copy.intro}</p>
      </div>

      {!items.length ? (
        <div className={`${styles.empty} ${styles.compact}`}>
          <h3>{copy.emptyTitle}</h3>
          <p>{copy.emptyDescription}</p>
          <button
            className={styles.link}
            onClick={() => router.push(href("/wardrobe"))}
          >
            {copy.backToWardrobe} →
          </button>
        </div>
      ) : (
        <div className={styles.layout}>
          <aside className={styles.controls}>
            <div className={styles.controlsScroll}>
              <label className={styles.fieldTitle} htmlFor="anchor">
                {copy.anchorLabel}
              </label>
              <select
                id="anchor"
                value={selected?.id}
                onChange={(event) => selectItem(event.target.value)}
              >
                {items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} — {getCategoryLabel(messages, item.category)}
                  </option>
                ))}
              </select>

              {selected && (
                <div className={styles.editor}>
                  <img src={selected.image} alt={selected.name} />
                  <input
                    value={selected.name}
                    onChange={(event) =>
                      updateItem(selected.id, { name: event.target.value })
                    }
                    aria-label={copy.itemNameLabel}
                  />
                  <label className={styles.categoryField}>
                    {copy.categoryLabel}
                    <select
                      value={selected.category}
                      onChange={(event) =>
                        updateItem(selected.id, {
                          category: event.target.value as Category,
                        })
                      }
                    >
                      {categories.map((value) => (
                        <option key={value} value={value}>
                          {getCategoryLabel(messages, value)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <MultiField
                    label={copy.colorsLabel}
                    item={selected}
                    field="colors"
                    values={colors}
                  />
                  <MultiField
                    label={copy.seasonsLabel}
                    item={selected}
                    field="seasons"
                    values={seasons}
                  />
                  <MultiField
                    label={copy.patternsLabel}
                    item={selected}
                    field="patterns"
                    values={patterns}
                  />
                  <MultiField
                    label={copy.potentialStylesLabel}
                    item={selected}
                    field="styles"
                    values={wardrobeStyles}
                  />
                </div>
              )}

              <span className={styles.fieldTitle}>
                {copy.wantedStyleLabel}
              </span>
              <div className={styles.styleGrid}>
                {wardrobeStyles.map((style) => (
                  <button
                    key={style}
                    className={
                      wantedStyle === style ? styles.active : undefined
                    }
                    aria-pressed={wantedStyle === style}
                    onClick={() => setWantedStyle(style)}
                  >
                    {messages.attributes.styles[style]}
                  </button>
                ))}
              </div>
            </div>
            <div className={styles.controlsActions}>
              <button
                className={styles.generate}
                onClick={() => createOutfit(selected?.id)}
              >
                {copy.composeOutfit} <span>→</span>
              </button>
            </div>
          </aside>

          <div className={styles.canvas}>
            {outfit.length ? (
              <>
                <div className={styles.outfitHead}>
                  <div>
                    <p className={styles.eyebrow}>
                      {copy.suggestion} ·{" "}
                      {messages.attributes.styles[wantedStyle].toLocaleUpperCase(
                        locale,
                      )}
                    </p>
                    <h2>{copy.outfitTitle}</h2>
                  </div>
                  <span>
                    {outfit.length}{" "}
                    {outfit.length === 1
                      ? copy.pieceCountOne
                      : copy.pieceCountMany}
                  </span>
                </div>
                <div className={styles.outfitGrid}>
                  {outfit.map((item) => (
                    <article key={item.id}>
                      <img src={item.image} alt={item.name} />
                      <p>{getCategoryLabel(messages, item.category)}</p>
                      <h3>{item.name}</h3>
                    </article>
                  ))}
                </div>
                <div className={styles.styleNote}>
                  <b>✦</b>
                  <div>
                    <strong>{copy.whyItWorks}</strong>
                    <p>
                      {formatMessage(
                        outfit.some((item) =>
                          item.colors.some((color) =>
                            neutralColors.includes(color),
                          ),
                        )
                          ? copy.neutralExplanation
                          : copy.colorfulExplanation,
                        {
                          style:
                            messages.attributes.styles[
                              wantedStyle
                            ].toLocaleLowerCase(locale),
                        },
                      )}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className={styles.placeholder}>
                <span>✦</span>
                <h2>{copy.placeholderTitle}</h2>
                <p>{copy.placeholderDescription}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default StudioView;
