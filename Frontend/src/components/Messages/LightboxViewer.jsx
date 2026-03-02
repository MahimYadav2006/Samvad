import React, { useEffect } from "react";
import { XIcon } from "@phosphor-icons/react";

export default function LightboxViewer({ isOpen, onClose, media }) {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen || !media) return null;

  const isImage = media.type === "image";
  const isVideo = media.type === "video";

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}>
      <button
        onClick={onClose}
        className="absolute top-5 right-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
      >
        <XIcon size={22} />
      </button>

      {isImage && (
        <img
          src={media.url}
          alt="Full preview"
          className="max-w-[90vw] max-h-[90vh] rounded-2xl shadow-2xl object-contain"
        />
      )}

      {isVideo && (
        <video
          src={media.url}
          controls
          autoPlay
          className="max-w-[90vw] max-h-[90vh] rounded-2xl shadow-2xl"
        />
      )}
    </div>
  );
}
