import React from "react";
import { X } from "@phosphor-icons/react";

export default function LightboxViewer({ isOpen, onClose, media }) {
  if (!isOpen || !media) return null;

  const isImage = media.type === "image";
  const isVideo = media.type === "video";

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <button onClick={onClose} className="absolute top-4 right-4 text-white text-3xl">
        <X size={32} />
      </button>

      {isImage && (
        <img
          src={media.url}
          alt="Full preview"
          className="max-w-full max-h-full rounded-lg"
        />
      )}

      {isVideo && (
        <video
          src={media.url}
          controls
          className="max-w-full max-h-full rounded-lg"
        />
      )}
    </div>
  );
}
