import { SunIcon, MoonIcon } from "@phosphor-icons/react";
import useColorMode from "../hooks/useColorMode";

function DarkModeSwitcher() {
  const [colorMode, setColorMode] = useColorMode();

  return (
    <li className="list-none">
      <label
        htmlFor="dark-mode-toggle"
        className={`
          relative block h-[1.875rem] w-[3.5rem] rounded-full
          ${colorMode === "dark" ? "bg-primary" : "bg-stroke"}
          cursor-pointer
        `}
      >
        <input
          id="dark-mode-toggle"
          type="checkbox"
          checked={colorMode === "dark"}
          onChange={() =>
            setColorMode(colorMode === "dark" ? "light" : "dark")
          }
          className="absolute inset-0 z-50 m-0 h-full w-full cursor-pointer opacity-0"
        />

        <span
          className={`
            absolute top-1/2 left-0 flex h-6 w-6 -translate-y-1/2
            items-center justify-center rounded-full bg-white
            duration-75 ease-linear
            ${
              colorMode === "dark"
                ? "translate-x-[1.75rem]"
                : "translate-x-[0.25rem]"
            }
          `}
        >
          {colorMode === "dark" ? <MoonIcon /> : <SunIcon />}
        </span>
      </label>
    </li>
  );
}

export default DarkModeSwitcher;
