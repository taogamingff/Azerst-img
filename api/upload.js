import { put } from "@vercel/blob";
import crypto from "crypto";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

function makeFilename() {
  return `${crypto.randomBytes(12).toString("hex")}.png`;
}

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
        error: "Không nhận được hình ảnh."
      });
    }

    if (file.type !== "image/png") {
      return res.status(400).json({
        ok: false,
        error: "Server chỉ nhận PNG. Hãy dùng giao diện website để tự chuyển ảnh sang PNG."
      });
    }

    if (!file.size || file.size > MAX_FILE_SIZE) {
      return res.status(413).json({
        ok: false,
        error: "Dung lượng ảnh tối đa là 10MB."
      });
    }

    const filename = makeFilename();

    await put(`images/${filename}`, file, {
      access: "public",
      contentType: "image/png",
      addRandomSuffix: false
    });

    const baseUrl =
      process.env.IMAGE_BASE_URL ||
      `https://${req.headers.host}`;

    const url = `${baseUrl}/${filename}`;

    return res.status(200).json({
      ok: true,
      url,
      filename,
      mimeType: "image/png",
      size: file.size,
      createdAt: new Date().toISOString()
    });

  } catch (error) {
    console.error("UPLOAD_ERROR:", error);

    return res.status(500).json({
      ok: false,
      error: "Upload ảnh thất bại.",
      detail: error?.message || "Unknown error"
    });
  }
}
