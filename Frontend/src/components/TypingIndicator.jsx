export default function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 py-1">
      <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm bg-gray-2 px-4 py-3 shadow-sm dark:bg-meta-4">
        <span className="tidot bg-primary/70 dark:bg-primary/80"></span>
        <span className="tidot bg-primary/70 dark:bg-primary/80"></span>
        <span className="tidot bg-primary/70 dark:bg-primary/80"></span>
      </div>
      <span className="mb-0.5 text-[11px] font-medium text-body/70 dark:text-bodydark/70">
        typing
      </span>
    </div>
  );
}