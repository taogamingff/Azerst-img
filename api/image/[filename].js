import { list } from "@vercel/blob";

export default async function handler(request, response) {
  try {
    const filename = request.query.filename;

    if (!filename) {
      return response.status(400).send("Missing filename");
    }

    // Chống path traversal
    if (
      filename.includes("/") ||
      filename.includes("\\") ||
      filename.includes("..")
    ) {
      return response.status(400).send("Invalid filename");
    }

    const result = await list({
      prefix: `images/${filename}`,
      limit: 1
    });

    if (!result.blobs || result.blobs.length === 0) {
      return response.status(404).send("Image not found");
    }

    const blob = result.blobs[0];

    // Cache mạnh để URL ảnh tải nhanh
    response.setHeader(
      "Cache-Control",
      "public, max-age=31536000, immutable"
    );

    // Chuyển tới Vercel Blob
    return response.redirect(302, blob.url);

  } catch (error) {
    console.error(error);

    return response.status(500).send("Server Error");
  }
}
