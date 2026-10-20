export const imageUploadRoute = "/api/images/upload";

export const allowedImageTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
];

export const maxImageBytes = 10 * 1024 * 1024;

export function imageFileProblem(file: { size: number; type: string }) {
  if (!allowedImageTypes.includes(file.type)) {
    return "Use a JPEG, PNG, WebP, GIF, or AVIF image.";
  }
  if (file.size > maxImageBytes) {
    return "Images must be 10 MB or smaller.";
  }
  return null;
}
