import React, { useState } from "react";
import { CheckIcon, ChecksIcon } from "@phosphor-icons/react";
import LightboxViewer from "./LightboxViewer";

export default function MediaMessage({ incoming, timestamp, read_receipt, media, content }) {
  const [open, setOpen] = useState(false);
  const mediaItem = media?.[0];

  const isImage = mediaItem?.type === "image";
  const isVideo = mediaItem?.type === "video";

  const MediaThumb = () => (
    <div
      className="rounded-xl overflow-hidden cursor-zoom-in"
      onClick={() => setOpen(true)}
    >
      {isImage && (
        <img
          src={mediaItem.url}
          alt="media"
          className="max-h-64 object-cover"
        />
      )}
      {isVideo && (
        <video
          src={mediaItem.url}
          className="max-h-64"
          muted
        />
      )}
    </div>
  );

  return (
    <>
      <LightboxViewer isOpen={open} onClose={() => setOpen(false)} media={mediaItem} />
      {incoming ? (
        <div className="max-w-[min(85%,22rem)] w-fit">
          <div className="mb-1.5 rounded-2xl rounded-tl-sm bg-white/90 dark:bg-boxdark-2/90 border border-stroke/40 dark:border-strokedark/40 shadow-sm px-3 py-2.5 space-y-2">
            <MediaThumb />
            {content && <p className="text-sm">{content}</p>}
          </div>
          <p className="text-[11px] text-body/60 dark:text-bodydark/50 ml-1">{timestamp}</p>
        </div>
      ) : (
        <div className="max-w-[min(85%,22rem)] w-fit ml-auto">
          <div className="mb-1.5 rounded-2xl rounded-br-sm bg-gradient-to-br from-primary to-primary/90 shadow-md shadow-primary/15 px-3 py-2.5 space-y-2">
            <MediaThumb />
            {content && <p className="text-sm text-white">{content}</p>}
          </div>
          <div className="flex flex-row items-center justify-end gap-1.5">
            <div className={`${read_receipt === "read" ? "text-primary" : "text-body/50 dark:text-bodydark/40"}`}>
              {read_receipt !== "sent" ? (
                <ChecksIcon weight="bold" size={15} />
              ) : (
                <CheckIcon weight="bold" size={15} />
              )}
            </div>
            <p className="text-[11px] text-body/60 dark:text-bodydark/50">{timestamp}</p>
          </div>
        </div>
      )}
    </>
  );
}
