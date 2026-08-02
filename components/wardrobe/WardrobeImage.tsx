/* Les images privées nécessitent le cookie de session et sont chargées directement. */
/* eslint-disable @next/next/no-img-element */

import styles from "./WardrobeImage.module.scss";

type WardrobeImageProps = {
  alt: string;
  className?: string;
  isPending?: boolean;
  src: string | null;
};

const WardrobeImage = ({ alt, className, isPending = false, src }: WardrobeImageProps) =>
  src && !isPending ? (
    <img className={className} src={src} alt={alt} />
  ) : (
    <div
      className={`${styles.fallback} ${isPending ? styles.pending : ""} ${className ?? ""}`}
      role="img"
      aria-label={alt}
    >
      {!isPending ? <span aria-hidden="true">✦</span> : null}
    </div>
  );

export default WardrobeImage;
