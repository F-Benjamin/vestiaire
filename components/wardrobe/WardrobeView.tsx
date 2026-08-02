"use client";

import { useState } from "react";
import Link from "next/link";
import { useI18n } from "@/components/i18n/LocalizationProvider";
import {
  formatMessage,
  getCategoryLabel,
  getColorLabel,
} from "@/i18n/format";
import { categories } from "./wardrobe.constants";
import { useWardrobe } from "./WardrobeContext";
import WardrobeImage from "./WardrobeImage";
import UploadButton from "./UploadButton";
import styles from "./WardrobeView.module.scss";

const WardrobeView = () => {
  const {
    items,
    visibleItems,
    category,
    setCategory,
    setSelectedId,
    removeItem,
  } = useWardrobe();
  const { messages, href } = useI18n();
  const copy = messages.wardrobe;
  const categoryCount = new Set(items.map((item) => item.category)).size;
  const recentCutouts = items
    .filter(
      (item) =>
        item.cutout?.status === "accepted" &&
        item.originalImageUrl &&
        item.cutout.acceptedAt,
    )
    .sort(
      (first, second) =>
        new Date(second.cutout?.acceptedAt ?? 0).getTime() -
        new Date(first.cutout?.acceptedAt ?? 0).getTime(),
    )
    .slice(0, 4);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleRemoveItem = (itemId: string) => {
    if (deletingId) return;

    setDeletingId(itemId);
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    window.setTimeout(
      () => {
        removeItem(itemId);
        setDeletingId(null);
      },
      prefersReducedMotion ? 0 : 460,
    );
  };

  return (
    <>
      <section className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>{copy.heroEyebrow}</p>
          <h1>
            {copy.heroTitleFirst}
            <br />
            {copy.heroTitleSecond}
          </h1>
          <p className={styles.intro}>{copy.heroIntro}</p>
        </div>
        <div className={styles.stats}>
          <strong>{items.length}</strong>
          <span>
            {items.length === 1 ? copy.itemCountOne : copy.itemCountMany}
          </span>
          <div>
            <b>{categoryCount}</b>
            <span>{copy.categoryCount}</span>
          </div>
        </div>
      </section>

      {recentCutouts.length ? (
        <section className={styles.recentCutouts} aria-labelledby="recent-cutouts">
          <div>
            <p className={styles.eyebrow}>{copy.recentCutoutsEyebrow}</p>
            <h2 id="recent-cutouts">{copy.recentCutoutsTitle}</h2>
            <p>{copy.recentCutoutsDescription}</p>
          </div>
          <div className={styles.recentCutoutGrid}>
            {recentCutouts.map((item) => (
              <Link
                key={item.id}
                className={styles.recentCutout}
                href={`${href("/studio")}?piece=${encodeURIComponent(item.id)}&original=1`}
                onClick={() => setSelectedId(item.id)}
              >
                <WardrobeImage src={item.imageUrl} alt={item.name} />
                <span>{item.name}</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className={styles.wardrobe}>
        <div className={styles.sectionTitle}>
          <div>
            <p className={styles.eyebrow}>{copy.collection}</p>
            <h2>{copy.title}</h2>
          </div>
          <div
            className={styles.tabs}
            role="group"
            aria-label={copy.filterByCategory}
          >
            {(["Tout", ...categories] as const).map((value) => (
              <button
                key={value}
                className={category === value ? styles.active : undefined}
                onClick={() => setCategory(value)}
                aria-pressed={category === value}
              >
                {value === "Tout"
                  ? messages.common.all
                  : getCategoryLabel(messages, value)}
                {value !== "Tout" && (
                  <sup>
                    {items.filter((item) => item.category === value).length}
                  </sup>
                )}
              </button>
            ))}
          </div>
        </div>

        {visibleItems.length ? (
          <div className={styles.itemGrid}>
            {visibleItems.map((item) => {
              const isDeleting = deletingId === item.id;

              return (
                <article
                  className={`${styles.itemCard} ${
                    isDeleting ? styles.deleting : ""
                  }`}
                  key={item.id}
                  aria-busy={isDeleting}
                >
                  <Link
                    className={styles.photo}
                    href={`${href("/studio")}?piece=${encodeURIComponent(item.id)}`}
                    onClick={() => {
                      setSelectedId(item.id);
                    }}
                  >
                    <WardrobeImage
                      src={item.imageUrl}
                      alt={item.name}
                      isPending={item.cutout?.status === "pending"}
                    />
                    {isDeleting && (
                      <span className={styles.tearFragments} aria-hidden="true">
                        <i
                          className={`${styles.tearFragment} ${styles.tearFragmentStart}`}
                          style={{
                            backgroundImage: item.imageUrl
                              ? `url("${item.imageUrl}")`
                              : undefined,
                          }}
                        />
                        <i
                          className={`${styles.tearFragment} ${styles.tearFragmentEnd}`}
                          style={{
                            backgroundImage: item.imageUrl
                              ? `url("${item.imageUrl}")`
                              : undefined,
                          }}
                        />
                      </span>
                    )}
                    <span>{copy.composeAround}</span>
                  </Link>
                  <div className={styles.itemMeta}>
                    <div>
                      <h3>{item.name}</h3>
                      <p>
                        {getCategoryLabel(messages, item.category)} ·{" "}
                        {item.colors
                          .map((color) => getColorLabel(messages, color))
                          .join(", ")}
                      </p>
                    </div>
                    <button
                      className={styles.remove}
                      onClick={() => handleRemoveItem(item.id)}
                      aria-label={formatMessage(copy.removeItem, {
                        name: item.name,
                      })}
                      disabled={Boolean(deletingId)}
                    >
                      ×
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className={styles.empty}>
            <div className={styles.emptyMark}>⌁</div>
            <h3>
              {items.length
                ? formatMessage(copy.emptyFilteredTitle, {
                    category:
                      category === "Tout"
                        ? messages.common.all
                        : getCategoryLabel(messages, category),
                  })
                : copy.emptyTitle}
            </h3>
            <p>
              {items.length
                ? copy.emptyFilteredDescription
                : copy.emptyDescription}
            </p>
            <UploadButton large />
          </div>
        )}
      </section>
    </>
  );
};

export default WardrobeView;
