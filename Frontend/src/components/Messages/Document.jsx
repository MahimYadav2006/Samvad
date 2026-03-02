import React from 'react';
import { FileIcon, DownloadSimple as DownloadSimpleIcon, Check as CheckIcon, Checks as ChecksIcon } from '@phosphor-icons/react';

export default function Document({ text, incoming, timestamp, read_receipt, document }) {
  return incoming ? (
    <div className="max-w-[min(85%,24rem)] w-fit">
      <div className="rounded-2xl rounded-tl-sm bg-white/90 dark:bg-boxdark-2/90 border border-stroke/40 dark:border-strokedark/40 shadow-sm px-4 py-2.5 space-y-1.5">
        <div className="flex items-center justify-between bg-gray-2/80 dark:bg-boxdark/60 rounded-xl p-2.5">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <FileIcon size={20} />
            </div>
            <div className="flex flex-col">
              <div className="text-sm font-medium truncate max-w-[160px]">{document.name}</div>
              <div className="text-[11px]">{document.size / 1000} KB</div>
            </div>
          </div>
          <a
            href={document.url}
            download={document.name}
            target="_blank"
            rel="noopener noreferrer"
            className="pl-3 text-body/70 hover:text-primary transition-colors"
          >
            <DownloadSimpleIcon size={16} />
          </a>
        </div>
        {text && <p className="text-sm">{text}</p>}
      </div>
      <p className="text-[11px] text-body/60 dark:text-bodydark/50 ml-1 mt-1">{timestamp}</p>
    </div>
  ) : (
    <div className="max-w-[min(85%,24rem)] w-fit ml-auto">
      <div className="rounded-2xl rounded-br-sm bg-gradient-to-br from-primary to-primary/90 shadow-md shadow-primary/15 px-4 py-2.5 text-white space-y-1.5">
        <div className="flex items-center justify-between bg-white/15 rounded-xl p-2.5">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-white/20 text-white">
              <FileIcon size={20} />
            </div>
            <div className="flex flex-col">
              <div className="text-sm font-medium truncate max-w-[160px]">{document.name}</div>
              <div className="text-[11px] text-white/70">{document.size / 1000} KB</div>
            </div>
          </div>
          <a
            href={document.url}
            download={document.name}
            target="_blank"
            rel="noopener noreferrer"
            className="pl-3 text-white/70 hover:text-white transition-colors"
          >
            <DownloadSimpleIcon size={16} />
          </a>
        </div>
        {text && <p className="text-sm">{text}</p>}
      </div>
      <div className="flex items-center justify-end gap-1.5 mt-1">
        <div className={read_receipt === "read" ? "text-primary" : "text-body/50 dark:text-bodydark/40"}>
          {read_receipt !== "sent" ? (
            <ChecksIcon weight="bold" size={15} />
          ) : (
            <CheckIcon weight="bold" size={15} />
          )}
        </div>
        <p className="text-[11px] text-body/60 dark:text-bodydark/50 ml-1">{timestamp}</p>
      </div>
    </div>
  );
}
