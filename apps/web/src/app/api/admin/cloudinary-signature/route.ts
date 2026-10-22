import { createHash, randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { isCompanyAdmin } from "@/lib/authorization";

export const runtime = "nodejs";

export async function POST() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !(await isCompanyAdmin(session.user.id))) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    return Response.json({ error: "Cloudinary is not configured." }, { status: 503 });
  }

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const publicId = `product-images/${randomUUID()}`;
  const params = {
    allowed_formats: "jpg,jpeg,png,webp,avif",
    public_id: publicId,
    timestamp,
  };
  const toSign = Object.entries(params)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
  const signature = createHash("sha1")
    .update(`${toSign}${apiSecret}`)
    .digest("hex");

  return Response.json({ cloudName, apiKey, timestamp, publicId, signature });
}
