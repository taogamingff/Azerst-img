import { head } from "@vercel/blob";

export default async function handler(req, res) {
  try {
    const name =
      req.query?.name;

    if (
      !name ||
      !/^[a-z0-9]{6}\.(png|jpg|webp|gif)$/i.test(
        name
      )
    ) {
      return res.status(404).send(
        "Image not found"
      );
    }

    const blob = await head(name);

    if (!blob || !blob.url) {
      return res.status(404).send(
        "Image not found"
      );
    }

    res.setHeader(
      "Cache-Control",
      "public, max-age=31536000, immutable"
    );

    return res.redirect(
      302,
      blob.url
    );

  } catch (error) {
    console.error(
      "IMAGE ERROR:",
      error
    );

    return res.status(404).send(
      "Image not found"
    );
  }
}
