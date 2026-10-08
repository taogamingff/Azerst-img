import { head } from "@vercel/blob";

export default async function handler(req, res) {
  try {
    const filename = req.query.filename;

    if (
      !filename ||
      filename.includes("/") ||
      filename.includes("\\") ||
      filename.includes("..") ||
      !filename.toLowerCase().endsWith(".png")
    ) {
      return res.status(400).send("Invalid filename");
    }

    const blob = await head(`images/${filename}`);

    res.setHeader(
      "Cache-Control",
      "public, max-age=31536000, immutable"
    );

    res.setHeader(
      "Content-Type",
      "image/png"
    );

    return res.redirect(302, blob.url);

  } catch (error) {

    if (
      error?.status === 404 ||
      /not found/i.test(error?.message || "")
    ) {
      return res.status(404).send("Image not found");
    }

    console.error("IMAGE_ERROR:", error);

    return res.status(500).send(
      "Server Error"
    );
  }
}
