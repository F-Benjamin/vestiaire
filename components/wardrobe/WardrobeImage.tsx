/* Les images privées nécessitent le cookie de session et sont chargées directement. */
/* eslint-disable @next/next/no-img-element */

import styles from "./WardrobeImage.module.scss";

type WardrobeImageProps = {
  alt: string;
  className?: string;
  src: string | null;
};

const WardrobeImage = ({ alt, className, src }: WardrobeImageProps) =>
  src ? (
    <img className={className} src={src} alt={alt} />
  ) : (
    <div
      className={`${styles.fallback} ${className ?? ""}`}
      role="img"
      aria-label={alt}
    >
      <span aria-hidden="true">✦</span>
    </div>
  );

export default WardrobeImage;
