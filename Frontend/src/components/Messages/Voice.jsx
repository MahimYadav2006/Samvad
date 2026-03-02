import React from 'react';
import { CheckIcon, ChecksIcon } from '@phosphor-icons/react';
import Waveform from '../Waveform';

export default function Voice({ audioUrl, incoming, timestamp, read_receipt }) {
  return incoming ? (
    <div className="w-fit max-w-[min(85%,20rem)]">
      <div className="mb-1.5 rounded-2xl rounded-tl-sm bg-white/90 dark:bg-boxdark-2/90 border border-stroke/40 dark:border-strokedark/40 shadow-sm px-5 py-3">
        <Waveform incoming={incoming} audioUrl={audioUrl} />
      </div>
      <p className="text-[11px] text-body/60 dark:text-bodydark/50">
        {timestamp}
      </p>
    </div>
  ) : (
    <div className="ml-auto w-fit max-w-[min(85%,20rem)]">
      <div className="mb-1.5 rounded-2xl rounded-br-sm bg-gradient-to-br from-primary to-primary/90 shadow-md shadow-primary/15 px-5 py-3">
        <Waveform incoming={incoming} audioUrl={audioUrl} />
      </div>
      <div className="flex flex-row items-center justify-end gap-1.5">
        <div
          className={`${
            read_receipt !== 'read'
              ? 'text-body/60 dark:text-bodydark/50'
              : 'text-primary'
          }`}
        >
          {read_receipt !== 'sent' ? (
            <ChecksIcon weight="bold" size={16} />
          ) : (
            <CheckIcon weight="bold" size={16} />
          )}
        </div>
        <p className="text-[11px] text-body/60 dark:text-bodydark/50">
          {timestamp}
        </p>
      </div>
    </div>
  );
}
