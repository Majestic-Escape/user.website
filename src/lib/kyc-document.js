// Turns whatever a host picks for KYC (an iPhone/iPad photo, a HEIC, a WebP,
// a 12 MP camera shot, a screenshot, a PDF) into something the verify API
// accepts. The document travels as base64 JSON (≈ 4/3 of the file) through a
// Vercel function capped at 4.5 MB per request (see lib/image-upload.js), so
// photos are fitted well under it — documents stay legible: OCR needs ~1000 px
// on the long edge, we keep up to 2400 — small JPEG/PNG files go untouched,
// and a PDF, which cannot be shrunk here, must fit as is.
import { fitImage, ImagePrepError } from "./image-upload";

export const KYC_PDF_MAX_BYTES = 3_000_000; // ≈ 4.0 MB once base64-encoded

export class KycDocumentError extends Error {}

function isPdf(file) {
  return file.type === "application/pdf" || /\.pdf$/i.test(file.name || "");
}

// → { file: File, kind: "image" | "pdf" }; throws KycDocumentError with a
// message meant for the host.
export async function prepareKycDocument(file) {
  if (!file) throw new KycDocumentError("Please choose a file.");
  if (isPdf(file)) {
    if (file.size > KYC_PDF_MAX_BYTES) {
      throw new KycDocumentError("This PDF is larger than 3 MB. Please upload a smaller PDF, or a photo of the document instead.");
    }
    return { file, kind: "pdf" };
  }
  try {
    const { file: fitted } = await fitImage(file, { maxBytes: 2_000_000, maxEdge: 2400, passThroughMaxBytes: 1_500_000, qualities: [0.9, 0.8, 0.7], minEdge: 1600 });
    return { file: fitted, kind: "image" };
  } catch (error) {
    if (error instanceof ImagePrepError && error.code === "UNDECODABLE") {
      throw new KycDocumentError("We couldn't open this image. Please upload a JPG, PNG or PDF.");
    }
    if (error instanceof ImagePrepError) {
      throw new KycDocumentError("This image is too large to upload. Please take a closer, clearer photo of the document.");
    }
    throw new KycDocumentError("We couldn't read this file. Please choose it again.");
  }
}

export function readAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new KycDocumentError("We couldn't read this file. Please choose it again."));
    reader.readAsDataURL(file);
  });
}
