const MAX_UPLOAD_IMAGE_BYTES = 2 * 1024 * 1024;
const MAX_UPLOAD_IMAGE_DIMENSION = 3200;
const jpegQualities = [0.9, 0.82, 0.74, 0.66, 0.58, 0.5];
const resizeScales = [1, 0.82, 0.68, 0.54, 0.42];

const toJpegBlob = (canvas: HTMLCanvasElement, quality: number) =>
  new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
          return;
        }

        reject(new Error("The image could not be converted to JPEG."));
      },
      "image/jpeg",
      quality,
    );
  });

const loadImage = async (file: File) => {
  const url = URL.createObjectURL(file);

  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    return image;
  } finally {
    URL.revokeObjectURL(url);
  }
};

const getJpegFileName = (fileName: string) =>
  `${fileName.replace(/\.[^.]+$/, "") || "garment"}.jpg`;

export const optimizeUploadImage = async (file: File) => {
  const image = await loadImage(file);
  const initialScale = Math.min(
    1,
    MAX_UPLOAD_IMAGE_DIMENSION / Math.max(image.naturalWidth, image.naturalHeight),
  );

  for (const resizeScale of resizeScales) {
    const width = Math.max(1, Math.round(image.naturalWidth * initialScale * resizeScale));
    const height = Math.max(1, Math.round(image.naturalHeight * initialScale * resizeScale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) throw new Error("The image canvas is unavailable.");

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);

    for (const quality of jpegQualities) {
      const jpeg = await toJpegBlob(canvas, quality);
      if (jpeg.size <= MAX_UPLOAD_IMAGE_BYTES) {
        return new File([jpeg], getJpegFileName(file.name), {
          lastModified: file.lastModified,
          type: "image/jpeg",
        });
      }
    }
  }

  throw new Error("The image could not be optimized below 2 MB.");
};
