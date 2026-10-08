import { handleUpload } from "@vercel/blob/client";

const MAX_FILE_SIZE = 65 * 1024 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif"
];

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method Not Allowed"
    });
  }

  try {
    const response = await handleUpload({
      body: req.body,
      request: req,

      onBeforeGenerateToken: async (
        pathname,
        clientPayload
      ) => {
        let payload = {};

        try {
          payload = clientPayload
            ? JSON.parse(clientPayload)
            : {};
        } catch {
          payload = {};
        }

        const type = payload.contentType || "";
        const size = Number(payload.size || 0);

        if (!ALLOWED_TYPES.includes(type)) {
          throw new Error(
            "Chỉ hỗ trợ PNG, JPG, WEBP và GIF."
          );
        }

        if (size > MAX_FILE_SIZE) {
          throw new Error(
            "Dung lượng tối đa là 65 GB."
          );
        }

        /*
         * pathname được tạo từ trình duyệt.
         * Ví dụ:
         *
         * 7fas39.png
         */

        if (
          !/^[a-z0-9]{6}\.(png|jpg|webp|gif)$/i.test(
            pathname
          )
        ) {
          throw new Error(
            "Tên file không hợp lệ."
          );
        }

        return {
          allowedContentTypes: ALLOWED_TYPES,

          maximumSizeInBytes:
            MAX_FILE_SIZE,

          addRandomSuffix: false,

          cacheControlMaxAge:
            31536000
        };
      },

      onUploadCompleted: async ({
        blob
      }) => {
        console.log(
          "Azerst upload completed:",
          blob.url
        );
      }
    });

    return res.status(200).json(response);

  } catch (error) {
    console.error(
      "Azerst upload error:",
      error
    );

    return res.status(400).json({
      error:
        error?.message ||
        "Upload thất bại."
    });
  }
}
