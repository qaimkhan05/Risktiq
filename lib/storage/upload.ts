import { v2 as cloudinary } from "cloudinary";
import crypto from "crypto";

const cloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET
);

if (cloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

async function uploadToCloudinary(fileBuffer: Buffer, fileName: string) {
  return new Promise<string>((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream(
      {
        folder: "risktiq/trades",
        public_id: fileName,
        resource_type: "image"
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Cloud upload failed."));
          return;
        }

        resolve(result.secure_url);
      }
    );

    upload.end(fileBuffer);
  });
}

function createInlineImageUrl(fileBuffer: Buffer, mimeType: string) {
  return `data:${mimeType};base64,${fileBuffer.toString("base64")}`;
}

export async function uploadTradeScreenshot(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const fileBuffer = Buffer.from(arrayBuffer);
  const mimeType = file.type || "image/png";
  const maxFileSize = cloudinaryConfigured ? 8 * 1024 * 1024 : 2 * 1024 * 1024;

  if (!mimeType.startsWith("image/")) {
    throw new Error("Only image files can be uploaded.");
  }

  if (file.size > maxFileSize) {
    throw new Error(
      cloudinaryConfigured
        ? "Screenshot is too large. Use an image up to 8MB."
        : "Screenshot is too large for the current storage mode. Use an image up to 2MB."
    );
  }

  if (cloudinaryConfigured) {
    return uploadToCloudinary(fileBuffer, crypto.randomUUID());
  }

  return createInlineImageUrl(fileBuffer, mimeType);
}
