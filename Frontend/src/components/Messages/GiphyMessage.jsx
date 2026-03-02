import React from "react";
import { CheckIcon, ChecksIcon } from "@phosphor-icons/react";

export default function GiphyMessage({ incoming, timestamp, read_receipt, giphyUrl, content }) {
  return incoming ? (
    <div className="max-w-[min(85%,22rem)] w-fit">
      <div className="mb-1.5 rounded-2xl rounded-tl-sm bg-white/90 dark:bg-boxdark-2/90 border border-stroke/40 dark:border-strokedark/40 shadow-sm px-3 py-2.5 space-y-2">
        <div className="rounded-xl overflow-hidden">
          <img src={giphyUrl} alt="GIF" className="max-h-64 object-cover" />
        </div>
        {content && <p className="text-sm">{content}</p>}
      </div>
      <p className="text-[11px] text-body/60 dark:text-bodydark/50 ml-1">{timestamp}</p>
    </div>
  ) : (
    <div className="max-w-[min(85%,22rem)] w-fit ml-auto">
      <div className="mb-1.5 rounded-2xl rounded-br-sm bg-gradient-to-br from-primary to-primary/90 shadow-md shadow-primary/15 px-3 py-2.5 space-y-2">
        <div className="rounded-xl overflow-hidden">
          <img src={giphyUrl} alt="GIF" className="max-h-64 object-cover" />
        </div>
        {content && <p className="text-sm text-white">{content}</p>}
      </div>
      <div className="flex flex-row items-center justify-end gap-1.5">
        <span className={`${read_receipt === "read" ? "text-primary" : "text-body/50 dark:text-bodydark/40"}`}>
          {read_receipt !== "sent" ? (
            <ChecksIcon weight="bold" size={15} />
          ) : (
            <CheckIcon weight="bold" size={15} />
          )}
        </span>
        <p className="text-[11px] text-body/60 dark:text-bodydark/50">{timestamp}</p>
      </div>
    </div>
  );
}
