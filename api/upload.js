import { put } from "@vercel/blob";
import crypto from "crypto";

const ALLOWED_TYPES = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif"
};

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({
        ok: false,
        error: "Method Not Allowed"
      });
    }

    const formData = await req.formData();
    const file = formData.get("image");

    if (!file || typeof file === "string") {
      return res.status(400).json({
        ok: false,
        error: "Chưa chọn hình ảnh."
      });
    }

    const extension = ALLOWED_TYPES[file.type];

    if (!extension) {
      return res.status(400).json({
        ok: false,
        error: "Chỉ hỗ trợ JPG, PNG, WEBP và GIF."
      });
    }

    if (file.size > MAX_FILE_SIZE) {
      return res.status(413).json({
        ok: false,
        error: "Ảnh tối đa 10MB."
      });
    }

    const randomName =
      crypto.randomBytes(16).toString("hex");

    const filename =
      `${randomName}${extension}`;

    await put(
      `images/${filename}`,
      file,
      {
        access: "public",
        contentType: file.type,
        addRandomSuffix: false
      }
    );

    const imageBaseUrl =
      process.env.IMAGE_BASE_URL ||
      `https://${req.headers.host}`;

    const url =
      `${imageBaseUrl}/${filename}`;

    return res.status(200).json({
      ok: true,
      url,
      filename,
      mimeType: file.type,
      size: file.size,
      createdAt: new Date().toISOString()
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      ok: false,
      error: "Upload thất bại."
    });
  }
}
