import React, { useState } from "react";
import { CheckIcon, ChecksIcon } from "@phosphor-icons/react";
import LightboxViewer from "./LightboxViewer";

export default function MediaMessage({ incoming, author, timestamp, read_receipt, media, content }) {
  const [open, setOpen] = useState(false);
  const mediaItem = media?.[0];

  const isImage = mediaItem?.type === "image";
  const isVideo = mediaItem?.type === "video";

  const MediaThumb = () => (
    <div
      className="relative cursor-zoom-in group"
      onClick={() => setOpen(true)}
    >
      {isImage && (
        <img
          src={mediaItem.url}
          alt="media"
          className="rounded-md max-w-72 max-h-72 object-cover group-hover:scale-105 transition-transform"
        />
      )}
      {isVideo && (
        <video
          src={mediaItem.url}
          className="rounded-md max-w-72 max-h-72 group-hover:scale-105 transition-transform"
          muted
        />
      )}
    </div>
  );

  return (
    <>
      <LightboxViewer isOpen={open} onClose={() => setOpen(false)} media={mediaItem} />
      {incoming ? (
        <div className="max-w-125 w-fit">
          <p className="mb-2.5 text-sm font-medium capitalize">{author}</p>
          <div className="mb-2.5 rounded-2xl rounded-tl-none bg-gray px-4 py-3 dark:bg-boxdark-2 space-y-2">
            <MediaThumb />
            {content && <p>{content}</p>}
          </div>
          <p className="text-xs">{timestamp}</p>
        </div>
      ) : (
        <div className="max-w-125 w-fit ml-auto">
          <div className="mb-2.5 rounded-2xl rounded-br-none bg-primary px-4 py-3 text-white space-y-2">
            <MediaThumb />
            {content && <p>{content}</p>}
          </div>
          <div className="flex flex-row items-center justify-end space-x-2">
            <div className={`${read_receipt !== "read" ? "text-body dark:text-white" : "text-primary"}`}>
              {read_receipt !== "sent" ? (
                <ChecksIcon weight="bold" size={18} />
              ) : (
                <CheckIcon weight="bold" size={18} />
              )}
            </div>
            <p className="text-xs text-right">{timestamp}</p>
          </div>
        </div>
      )}
    </>
  );
}
