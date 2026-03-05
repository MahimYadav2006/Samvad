import React from "react";
import extractLinks from "../../utils/extractLinks";
import Microlink from "@microlink/react";
import { CheckIcon, ChecksIcon } from "@phosphor-icons/react";

const Text = React.memo(function Text({
  incoming,
  timestamp,
  read_receipt,
  content,
}) {
  const { links, originalString } = extractLinks(content);

  return incoming ? (
    <div className="max-w-[min(85%,28rem)] w-fit">
      <div className="mb-1 rounded-2xl rounded-tl-sm bg-white/90 px-4 py-2.5 shadow-sm dark:bg-boxdark-2/90 space-y-2 border border-stroke/40 dark:border-strokedark/40">
        <div
          className="text-sm leading-relaxed text-black dark:text-white/90"
          dangerouslySetInnerHTML={{ __html: originalString }}
        />
        {links.length > 0 && (
          <Microlink
            style={{ width: "100%", borderRadius: "0.75rem", overflow: "hidden" }}
            url={links[0]}
          />
        )}
      </div>
      <p className="text-[11px] text-body/60 dark:text-bodydark/50 ml-1">{timestamp}</p>
    </div>
  ) : (
    <div className="max-w-[min(85%,28rem)] ml-auto text-left w-fit">
      <div className="mb-1 rounded-2xl rounded-br-sm bg-gradient-to-br from-primary to-primary/90 px-4 py-2.5 shadow-md shadow-primary/15 space-y-2">
        <div
          className="text-sm leading-relaxed text-white"
          dangerouslySetInnerHTML={{ __html: originalString }}
        />
        {links.length > 0 && (
          <Microlink
            style={{ width: "100%", borderRadius: "0.75rem", overflow: "hidden" }}
            url={links[0]}
          />
        )}
      </div>
      <div className="flex items-center justify-end gap-1.5 mr-1">
        <span
          className={`${
            read_receipt === "read" ? "text-primary" : "text-body/50 dark:text-bodydark/40"
          }`}
        >
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
});

export default Text;
