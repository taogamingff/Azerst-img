import { handleUpload } from "@vercel/blob/client";

export default async function handler(request, response) {
  if (request.method !== "POST") {
    return response.status(405).json({
      error: "Method Not Allowed"
    });
  }

  try {
    const body = await request.json();

    const jsonResponse = await handleUpload({
      body,
      request,

      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const allowedTypes = [
          "image/png",
          "image/jpeg",
          "image/webp",
          "image/gif"
        ];

        return {
          allowedContentTypes: allowedTypes,

          // Giữ nguyên tên 6 ký tự do website tạo
          addRandomSuffix: false,

          tokenPayload: JSON.stringify({
            pathname,
            clientPayload: clientPayload || null
          })
        };
      },

      onUploadCompleted: async ({ blob }) => {
        console.log("Azerst upload completed:", blob.url);
      }
    });

    return response.status(200).json(jsonResponse);

  } catch (error) {
    console.error("UPLOAD ERROR:", error);

    return response.status(400).json({
      error: error?.message || "Upload failed"
    });
  }
}
