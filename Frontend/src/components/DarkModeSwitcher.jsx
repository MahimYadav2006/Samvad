import { SunIcon, MoonIcon } from "@phosphor-icons/react";
import useColorMode from "../hooks/useColorMode";

function DarkModeSwitcher({ className = "" }) {
  const [colorMode, setColorMode] = useColorMode();
  const isDark = colorMode === "dark";

  return (
    <button
      type="button"
      onClick={() => setColorMode(isDark ? "light" : "dark")}
      className={`relative inline-flex h-10 w-[4.6rem] items-center rounded-full border border-stroke bg-white/70 p-1 shadow-sm dark:border-strokedark dark:bg-boxdark-2 ${className}`}
      aria-label="Toggle color mode"
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <span className={`absolute left-2 text-bodydark2 transition-opacity ${isDark ? "opacity-40" : "opacity-90 text-amber-500"}`}>
        <SunIcon size={15} weight="fill" />
      </span>
      <span className={`absolute right-2 text-bodydark2 transition-opacity ${isDark ? "opacity-90 text-primary" : "opacity-40"}`}>
        <MoonIcon size={15} weight="fill" />
      </span>
      <span
        className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white text-black shadow-sm transition-transform dark:bg-slate-900 dark:text-white ${
          isDark ? "translate-x-[1.45rem]" : "translate-x-0"
        }`}
      >
        {isDark ? <MoonIcon size={16} weight="fill" /> : <SunIcon size={16} weight="fill" />}
      </span>
    </button>
  );
}

export default DarkModeSwitcher;
