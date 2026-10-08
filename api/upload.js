import { handleUpload } from "@vercel/blob/client";

const ALLOWED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif"
];

const MAX_FILE_SIZE = 65 * 1024 * 1024 * 1024;

function randomName(length = 6) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = new Uint8Array(length);

  crypto.getRandomValues(bytes);

  let result = "";

  for (let i = 0; i < length; i++) {
    result += chars[bytes[i] % chars.length];
  }

  return result;
}

function getExtension(contentType) {
  switch (contentType) {
    case "image/png":
      return ".png";

    case "image/jpeg":
      return ".jpg";

    case "image/webp":
      return ".webp";

    case "image/gif":
      return ".gif";

    default:
      return "";
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method Not Allowed"
    });
  }

  try {
    const body = req.body || {};

    /*
     * Client upload flow.
     */
    const response = await handleUpload({
      body,
      request: req,

      onBeforeGenerateToken: async (pathname, clientPayload) => {
        let data = {};

        try {
          data = clientPayload
            ? JSON.parse(clientPayload)
            : {};
        } catch {
          data = {};
        }

        const contentType = data.contentType || "";

        if (!ALLOWED_TYPES.includes(contentType)) {
          throw new Error("Định dạng ảnh không được hỗ trợ.");
        }

        const size = Number(data.size || 0);

        if (size > MAX_FILE_SIZE) {
          throw new Error("Dung lượng tối đa là 65 GB.");
        }

        const extension = getExtension(contentType);

        /*
         * Tên file cuối cùng:
         * 6 ký tự + extension
         *
         * Ví dụ:
         * 7fas39.png
         */
        const finalName = `${randomName(6)}${extension}`;

        return {
          allowedContentTypes: ALLOWED_TYPES,
          maximumSizeInBytes: MAX_FILE_SIZE,

          addRandomSuffix: false,

          tokenPayload: JSON.stringify({
            originalName: data.originalName || "",
            finalName
          })
        };
      },

      onUploadCompleted: async ({ blob, tokenPayload }) => {
        console.log("Upload completed:", blob.url);
        console.log("Payload:", tokenPayload);
      }
    });

    return res.status(200).json(response);

  } catch (error) {
    console.error(error);

    return res.status(400).json({
      error: error?.message || "Upload thất bại."
    });
  }
}
