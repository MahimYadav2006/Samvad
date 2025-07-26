import React from "react";
import { CheckIcon, ChecksIcon } from "@phosphor-icons/react";

export default function GiphyMessage({
  incoming,
  author,
  timestamp,
  read_receipt,
  giphyUrl,
  content,
}) {
  const bubbleBase =
    "max-w-125 px-4 py-3 rounded-2xl shadow-sm space-y-2 text-sm";
  const gifStyle =
    "rounded-lg max-h-64 object-cover mx-auto border border-gray-200";

  return incoming ? (
    <div className="max-w-125 flex flex-col gap-1">
      <p className="mb-1 text-xs text-gray-500 dark:text-gray-400 font-medium">{author}</p>

      <div
        className={`${bubbleBase} bg-gray dark:bg-boxdark-2 rounded-tl-none`}
      >
        <img src={giphyUrl} alt="GIF" className={gifStyle} />
        {content && <p className="text-sm text-gray-800 dark:text-gray-200">{content}</p>}
      </div>

      <p className="text-xs text-gray-400">{timestamp}</p>
    </div>
  ) : (
    <div className="max-w-125 ml-auto flex flex-col gap-1 items-end">
      <div
        className={`${bubbleBase} bg-primary text-white rounded-br-none`}
      >
        <img src={giphyUrl} alt="GIF" className={gifStyle} />
        {content && <p className="text-sm">{content}</p>}
      </div>

      <div className="flex flex-row items-center justify-end gap-1 text-xs text-gray-300">
        <span
          className={`${
            read_receipt === "read" ? "text-primary" : "text-gray-300"
          }`}
        >
          {read_receipt !== "sent" ? (
            <ChecksIcon weight="bold" size={16} />
          ) : (
            <CheckIcon weight="bold" size={16} />
          )}
        </span>
        <p>{timestamp}</p>
      </div>
    </div>
  );
}
