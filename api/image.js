import { head } from "@vercel/blob";

export default async function handler(request, response) {
  try {
    const url = new URL(request.url);

    const name = url.searchParams.get("name");

    if (!name) {
      return response.status(400).send("Missing image name");
    }

    // Chỉ cho phép tên dạng:
    // abc123.png
    // 7fas39.jpg
    // a82k1z.webp
    // x91abc.gif
    const validName =
      /^[a-z0-9]{6}\.(png|jpg|jpeg|webp|gif)$/i.test(name);

    if (!validName) {
      return response.status(400).send("Invalid image name");
    }

    const blob = await head(name);

    if (!blob || !blob.url) {
      return response.status(404).send("Image not found");
    }

    return response.redirect(blob.url, 302);

  } catch (error) {
    console.error("IMAGE ERROR:", error);

    return response.status(404).send("Image not found");
  }
}
