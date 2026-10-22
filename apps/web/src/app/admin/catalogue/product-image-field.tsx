"use client";

import { useRef, useState } from "react";

const MAX_BYTES = 5 * 1024 * 1024;

export function ProductImageField({
  initialUrl,
  initialPublicId,
}: {
  initialUrl?: string | null;
  initialPublicId?: string | null;
}) {
  const [image, setImage] = useState({
    url: initialUrl ?? "",
    publicId: initialPublicId ?? "",
  });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function upload(file?: File) {
    if (!file) return;
    setError("");
    if (!file.type.startsWith("image/")) {
      setError("Choose an image file.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Choose an image under 5 MB.");
      return;
    }

    setUploading(true);
    try {
      const signatureResponse = await fetch("/api/admin/cloudinary-signature", {
        method: "POST",
      });
      const signatureData = await signatureResponse.json();
      if (!signatureResponse.ok)
        throw new Error(signatureData.error ?? "Could not start image upload.");

      const body = new FormData();
      body.append("file", file);
      body.append("api_key", signatureData.apiKey);
      body.append("timestamp", signatureData.timestamp);
      body.append("public_id", signatureData.publicId);
      body.append("allowed_formats", "jpg,jpeg,png,webp,avif");
      body.append("signature", signatureData.signature);
      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/image/upload`,
        {
          method: "POST",
          body,
        },
      );
      const uploaded = await uploadResponse.json();
      if (!uploadResponse.ok)
        throw new Error(uploaded.error?.message ?? "Image upload failed.");
      setImage({ url: uploaded.secure_url, publicId: uploaded.public_id });
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Image upload failed.",
      );
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="grid gap-2 sm:col-span-2">
      <span className="text-xs font-medium text-slate-700">Product image</span>
      <input name="imageUrl" type="hidden" value={image.url} />
      <input name="imagePublicId" type="hidden" value={image.publicId} />
      <div className="flex items-center gap-3">
        {image.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt="Product preview"
            className="size-16 rounded-lg border border-slate-200 object-cover"
            src={image.url}
          />
        ) : (
          <div className="grid size-16 place-items-center rounded-lg border border-dashed border-slate-300 text-[10px] text-slate-400">
            No image
          </div>
        )}
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="sr-only"
            onChange={(event) => void upload(event.currentTarget.files?.[0])}
            type="file"
          />
          <button
            className="h-9 rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            type="button"
          >
            {uploading
              ? "Uploading…"
              : image.url
                ? "Change image"
                : "Choose image"}
          </button>
          {image.url ? (
            <button
              className="text-xs text-rose-700 hover:text-rose-800"
              onClick={() => setImage({ url: "", publicId: "" })}
              type="button"
            >
              Remove
            </button>
          ) : null}
        </div>
      </div>
      <span className="text-xs font-normal text-slate-400">
        JPEG, PNG, WebP or other image format up to 5 MB.
      </span>
      {error ? (
        <span className="text-xs text-rose-700" role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
}
