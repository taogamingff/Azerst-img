import { list } from "@vercel/blob";

export default async function handler(req, res) {

  try {

    const filename = req.query.filename;

    if (!filename) {
      return res.status(400).send("Missing filename");
    }

    if (
      filename.includes("/") ||
      filename.includes("\\") ||
      filename.includes("..")
    ) {
      return res.status(400).send("Invalid filename");
    }

    const result = await list({
      prefix: `images/${filename}`,
      limit: 1
    });

    if (
      !result.blobs ||
      result.blobs.length === 0
    ) {
      return res.status(404).send("Image not found");
    }

    const blob = result.blobs[0];

    res.setHeader(
      "Cache-Control",
      "public, max-age=31536000, immutable"
    );

    return res.redirect(302, blob.url);

  } catch (error) {

    console.error(error);

    return res.status(500).send(
      "Server Error"
    );
  }
}
