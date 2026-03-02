import {
  ChatIcon,
  SignOutIcon,
  UserCircleIcon,
  ChatTeardropTextIcon,
} from "@phosphor-icons/react";
import DarkModeSwitcher from "../components/DarkModeSwitcher";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { LogoutUser } from "../redux/slices/auth";

const NAVIGATION = [
  {
    key: 0,
    title: "Chats",
    icon: <ChatIcon size={21} weight="duotone" />,
    path: "/dashboard",
  },
  {
    key: 1,
    title: "Profile",
    icon: <UserCircleIcon size={21} weight="duotone" />,
    path: "/dashboard/profile",
  },
];

const getSelectedFromPath = (pathname) =>
  pathname.startsWith("/dashboard/profile") ? 1 : 0;

export default function Sidebar() {
  const dispatch = useDispatch();
  const [selected, setSelected] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setSelected(getSelectedFromPath(location.pathname));
  }, [location.pathname]);

  const handleClick = (key) => {
    setSelected(key);
    navigate(NAVIGATION[key].path);
  };

  const handleLogout = () => {
    dispatch(LogoutUser(navigate));
  };

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden h-full w-[4.5rem] shrink-0 border-r border-stroke/50 dark:border-strokedark/40 md:flex md:flex-col">
        <div className="flex items-center justify-center pt-5 pb-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-gradient-to-br from-primary via-primary/90 to-indigo-500 text-white shadow-lg shadow-primary/25">
            <ChatTeardropTextIcon size={23} weight="fill" />
          </div>
        </div>

        <nav className="flex flex-col items-center gap-1.5 px-2">
          {NAVIGATION.map(({ key, icon, title }) => {
            const isActive = selected === key;
            return (
              <button
                key={key}
                type="button"
                className={`group relative flex w-full flex-col items-center gap-0.5 rounded-xl px-1 py-2 text-[10px] font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-primary/10 text-primary dark:bg-primary/15"
                    : "text-body/70 hover:bg-gray-2 hover:text-black dark:text-bodydark/60 dark:hover:bg-meta-4/50 dark:hover:text-white"
                }`}
                onClick={() => handleClick(key)}
              >
                <span className={isActive ? "scale-105" : ""}>{icon}</span>
                <span className="tracking-wide">{title}</span>
                {isActive && (
                  <span className="absolute -left-[1px] top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-primary" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto flex flex-col items-center gap-3 px-2 pb-4">
          <DarkModeSwitcher />
          <button
            type="button"
            onClick={handleLogout}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-body/60 hover:bg-danger/8 hover:text-danger transition-colors dark:text-bodydark/50 dark:hover:text-danger"
            title="Logout"
          >
            <SignOutIcon size={19} weight="bold" />
          </button>
        </div>
      </aside>

      {/* Mobile bottom navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-99 px-3 pb-3 md:hidden">
        <div className="rounded-2xl border border-stroke/40 bg-white/92 p-1.5 shadow-xl shadow-black/[0.06] backdrop-blur-xl dark:border-strokedark/40 dark:bg-boxdark/92">
          <div className="grid grid-cols-4 items-center gap-1">
            {NAVIGATION.map(({ key, icon, title }) => {
              const isActive = selected === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleClick(key)}
                  className={`flex flex-col items-center justify-center rounded-xl px-1.5 py-2 text-[10px] font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-primary/10 text-primary dark:bg-primary/15"
                      : "text-body/60 dark:text-bodydark/50"
                  }`}
                >
                  {icon}
                  <span className="mt-0.5">{title}</span>
                </button>
              );
            })}

            <div className="flex items-center justify-center">
              <DarkModeSwitcher className="scale-[0.85]" />
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="flex flex-col items-center justify-center rounded-xl px-1.5 py-2 text-[10px] font-semibold text-danger/70 hover:bg-danger/8 transition-colors"
            >
              <SignOutIcon size={21} weight="bold" />
              <span className="mt-0.5">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
