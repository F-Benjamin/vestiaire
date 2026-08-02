"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
import WardrobeImage from "./WardrobeImage";
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
    acceptCutout,
    requestCutout,
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
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    if (selected?.cutout?.status !== "pending") return undefined;

    const updateCurrentTime = () => setCurrentTime(Date.now());
    updateCurrentTime();
    const interval = window.setInterval(updateCurrentTime, 8_000);

    return () => window.clearInterval(interval);
  }, [selected?.cutout?.status]);

  const isCutoutDelayed =
    selected?.cutout?.status === "pending" &&
    currentTime - new Date(selected.cutout.createdAt).getTime() > 90_000;

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
                  <WardrobeImage
                    src={selected.imageUrl}
                    alt={selected.name}
                    className={styles.editorImage}
                  />
                  {selected.cutout?.status === "pending" ? (
                    <>
                      <p className={styles.cutoutStatus}>{copy.cutoutPending}</p>
                      {isCutoutDelayed ? (
                        <p className={styles.cutoutWarning} role="alert">
                          {copy.cutoutDelayed}
                        </p>
                      ) : null}
                    </>
                  ) : null}
                  {selected.cutout?.status === "unavailable" ? (
                    <p className={styles.cutoutWarning} role="alert">
                      {copy.cutoutUnavailable}
                    </p>
                  ) : null}
                  {selected.cutout?.status === "failed" ? (
                    <p className={styles.cutoutWarning} role="alert">
                      {copy.cutoutFailed}
                    </p>
                  ) : null}
                  {selected.cutout?.status === "ready" &&
                  selected.cutoutImageUrl ? (
                    <section className={styles.cutoutReview}>
                      <div>
                        <p>{copy.cutoutReady}</p>
                        <span>
                          {selected.cutout.confidence === undefined
                            ? copy.cutoutConfidenceUnavailable
                            : formatMessage(copy.cutoutConfidence, {
                                score: Math.round(selected.cutout.confidence * 100),
                              })}
                        </span>
                      </div>
                      <WardrobeImage
                        src={selected.cutoutImageUrl}
                        alt={selected.name}
                        className={styles.cutoutImage}
                      />
                      <button
                        type="button"
                        onClick={() => acceptCutout(selected.id)}
                      >
                        {copy.acceptCutout}
                      </button>
                    </section>
                  ) : null}
                  {selected.cutout?.status === "accepted" ? (
                    <p className={styles.cutoutStatus}>
                      {copy.cutoutAccepted}
                    </p>
                  ) : null}
                  {(!selected.cutout ||
                    selected.cutout.status === "unavailable" ||
                    selected.cutout.status === "failed") &&
                  selected.originalImageKey ? (
                    <button
                      type="button"
                      className={styles.requestCutout}
                      onClick={() => requestCutout(selected.id)}
                    >
                      {copy.requestCutout}
                    </button>
                  ) : null}
                  <input
                    key={`${selected.id}:${selected.name}`}
                    defaultValue={selected.name}
                    onBlur={(event) => {
                      const name = event.currentTarget.value.trim();
                      if (name && name !== selected.name) {
                        updateItem(selected.id, { name });
                      }
                    }}
                    aria-label={copy.itemNameLabel}
                  />
                  <label className={styles.categoryField}>
                    <span>
                      {selected.analysis?.attributes.category?.value ===
                      selected.category ? (
                        <span
                          className={styles.suggestion}
                          aria-label={copy.analysisSuggestion}
                          title={copy.analysisSuggestion}
                        >
                          ✦
                        </span>
                      ) : null}
                      {copy.categoryLabel}
                      {selected.analysis?.attributes.category ? (
                        <span className={styles.confidence}>
                          {Math.round(
                            selected.analysis.attributes.category.confidence * 100,
                          )} %
                        </span>
                      ) : null}
                    </span>
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
                      <WardrobeImage
                        src={item.imageUrl}
                        alt={item.name}
                        className={styles.outfitImage}
                      />
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
