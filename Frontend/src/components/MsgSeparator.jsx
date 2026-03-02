export default function MsgSeparator({ date }) {
  const label =
    date && typeof date === "string" ? date : "Today";

  return (
    <div className="flex items-center gap-4 w-full py-3">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-stroke/60 to-transparent dark:via-strokedark/50" />
      <span className="px-3 py-1 rounded-full bg-gray-2/80 dark:bg-meta-4/60 text-[11px] font-semibold text-body/70 dark:text-bodydark/60 border border-stroke/30 dark:border-strokedark/30">
        {label}
      </span>
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-stroke/60 to-transparent dark:via-strokedark/50" />
    </div>
  );
}
