"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";

type Props = {
  value?: string;
  folder?: string;
  label?: string;
  onChange: (url: string) => void;
};

export default function ImageUploader({
  value,
  folder = "central-turnos",
  label = "Subir imagen",
  onChange,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file?: File) {
    if (!file) return;

    setUploading(true);

    try {
      const formData = new FormData();

      formData.append("file", file);
      formData.append("folder", folder);

      const response = await fetch("/api/upload/image", {
        method: "POST",
        body: formData,
      });

      const text = await response.text();

      const data = text
        ? JSON.parse(text)
        : { message: "Error al subir imagen" };

      if (!response.ok) {
        toast.error(data.message || "Error al subir imagen");
        return;
      }

      onChange(data.url);
      toast.success("Imagen subida correctamente");
    } catch (error) {
      console.error(error);
      toast.error("Ocurrió un error al subir imagen");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-3">
      {value && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Imagen subida"
            className="h-24 w-24 rounded-3xl border border-[var(--border)] object-cover"
          />
        </>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="rounded-xl border border-neutral-700 px-4 py-3 text-sm text-neutral-200 hover:bg-[var(--card)] disabled:opacity-60"
      >
        {uploading ? "Subiendo..." : label}
      </button>
    </div>
  );
}