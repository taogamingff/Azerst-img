import { put } from "@vercel/blob";
import crypto from "crypto";

const ALLOWED_TYPES = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif"
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

function checkApiKey(request) {
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    return false;
  }

  const receivedKey =
    request.headers.get("x-api-key") ||
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

  return receivedKey === apiKey;
}

function createFileName(extension) {
  const random = crypto.randomBytes(12).toString("hex");

  return `${random}${extension}`;
}

export default async function handler(request, response) {
  try {
    // Chỉ cho POST
    if (request.method !== "POST") {
      return response.status(405).json({
        ok: false,
        error: "Method Not Allowed"
      });
    }

    // Kiểm tra API Key
    if (!checkApiKey(request)) {
      return response.status(401).json({
        ok: false,
        error: "API Key không hợp lệ"
      });
    }

    // Lấy FormData
    const formData = await request.formData();

    const file = formData.get("image");

    if (!file || typeof file === "string") {
      return response.status(400).json({
        ok: false,
        error: "Vui lòng gửi file với field: image"
      });
    }

    // Kiểm tra MIME
    const extension = ALLOWED_TYPES[file.type];

    if (!extension) {
      return response.status(400).json({
        ok: false,
        error: "Chỉ hỗ trợ JPG, PNG, WEBP và GIF"
      });
    }

    // Kiểm tra dung lượng
    if (file.size > MAX_FILE_SIZE) {
      return response.status(413).json({
        ok: false,
        error: "Ảnh tối đa 10MB"
      });
    }

    // Tạo tên file
    const filename = createFileName(extension);

    // Upload Vercel Blob
    const blob = await put(
      `images/${filename}`,
      file,
      {
        access: "public",
        contentType: file.type,
        addRandomSuffix: false
      }
    );

    // Domain trả ảnh của bạn
    const baseUrl =
      process.env.IMAGE_BASE_URL ||
      `https://${request.headers.get("host")}`;

    const imageUrl =
      `${baseUrl}/${filename}`;

    return response.status(200).json({
      ok: true,
      message: "Upload thành công",
      url: imageUrl,
      filename: filename,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      blobUrl: blob.url,
      createdAt: new Date().toISOString()
    });

  } catch (error) {
    console.error(error);

    return response.status(500).json({
      ok: false,
      error: "Lỗi máy chủ",
      detail:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined
    });
  }
                                       }
